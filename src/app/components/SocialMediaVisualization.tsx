// threejs/src/app/components/SocialMediaVisualization.tsx

import React, { useRef, useEffect, useState, useCallback, FC } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import SettingsPanel from './SettingsPanel.tsx';

const COLORS: { [key: string]: number } = {
  Technology: 0x4e79a7,
  Business: 0xf28e2c,
  Science: 0xe15759,
  Health: 0x76b7b2,
};

interface RssFeed {
  url: string;
  category: string;
}

const RSS_FEEDS: RssFeed[] = [
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', category: 'Technology' },
  { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', category: 'Business' },
  { url: 'https://www.sciencedaily.com/rss/top.xml', category: 'Science' },
  { url: 'https://www.who.int/rss-feeds/news-english.xml', category: 'Health' },
];

interface Tooltip {
  content: string;
  x: number;
  y: number;
}

const SocialMediaVisualization: FC = () => {
  const [rssFeeds, setRssFeeds] = useState<RSSFeed[]>(RSS_FEEDS);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [settingsPanelOpen, setSettingsPanelOpen] = useState<boolean>(false);
  const [categoryVisibility, setCategoryVisibility] = useState<{ [key: string]: boolean }>({
    Technology: true,
    Business: true,
    Science: true,
    Health: true
  });
  const spheresRef = useRef<THREE.Mesh[]>([]);
  const sceneRef = useRef<THREE.Scene | null>(null);

  const debug = useCallback((message: string) => {
    console.log("Debug:", message);
  }, []);

  const filterPostsByTime = useCallback((posts: any[], filter: string): any[] => {
    debug("Filtering posts by time: " + filter);
    const now = new Date();
    return posts.filter((post) => {
      const postDate = new Date(post.pubDate);
      switch(filter) {
        case 'hour': return (now.getTime() - postDate.getTime()) < 3600000;
        case 'day': return (now.getTime() - postDate.getTime()) < 86400000;
        case 'week': return (now.getTime() - postDate.getTime()) < 604800000;
        default: return true;
      }
    });
  }, [debug]);

  const createParticleEffect = useCallback((position: THREE.Vector3) => {
    debug("Creating particle effect at position: " + JSON.stringify(position));
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 100;
    const posArray = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1
    });
    
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    particleSystem.position.copy(position);
    sceneRef.current?.add(particleSystem);
    
    setTimeout(() => {
      sceneRef.current?.remove(particleSystem);
    }, 2000);
  }, [debug]);

  const updateConnections = useCallback(() => {
    debug("Updating connections");
    if (!sceneRef.current) return;

    sceneRef.current.children = sceneRef.current.children.filter((child) => {
      return child.type !== 'Line';
    });

    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xcccccc, transparent: true, opacity: 0.3 });
    spheresRef.current.forEach((sphere, index) => {
      const post = sphere.userData;
      const relatedSpheres = spheresRef.current.filter((s, i) => {
        return i !== index && 
          (s.userData.category === post.category || 
           new Date(s.userData.pubDate).toDateString() === new Date(post.pubDate).toDateString());
      });

      relatedSpheres.forEach((relatedSphere) => {
        const geometry = new THREE.BufferGeometry().setFromPoints([
          sphere.position,
          relatedSphere.position
        ]);
        const line = new THREE.Line(geometry, lineMaterial);
        sceneRef.current?.add(line);
      });
    });
  }, [debug]);

  const updateVisualization = useCallback((oldPosts: any[], newPosts: any[]) => {
    debug("Updating visualization");
    if (!sceneRef.current) return;

    const filteredPosts = filterPostsByTime(newPosts, timeFilter)
      .filter((post) => {
        return categoryVisibility[post.category] && 
               post.title.toLowerCase().includes(searchTerm.toLowerCase());
      });

    debug("Filtered posts: " + filteredPosts.length);

    spheresRef.current.forEach((sphere) => {
      sceneRef.current?.remove(sphere);
    });

    const categoryPosition: { [key: string]: THREE.Vector3 } = {
      Technology: new THREE.Vector3(-50, 50, 0),
      Business: new THREE.Vector3(50, 50, 0),
      Science: new THREE.Vector3(-50, -50, 0),
      Health: new THREE.Vector3(50, -50, 0)
    };

    spheresRef.current = filteredPosts.map((post) => {
      const radius = (post.engagement / 100) * 3 + 1;
      const geometry = new THREE.SphereGeometry(radius, 32, 32);
      const material = new THREE.MeshPhongMaterial({ 
        color: COLORS[post.category],
        transparent: true,
        opacity: 0.7
      });
      const sphere = new THREE.Mesh(geometry, material);
      
      const basePosition = categoryPosition[post.category];
      const newPosition = new THREE.Vector3(
        basePosition.x + (Math.random() * 40 - 20),
        basePosition.y + (Math.random() * 40 - 20),
        basePosition.z + (Math.random() * 40 - 20)
      );

      if (oldPosts.find(oldPost => oldPost.id === post.id)) {
        sphere.position.set(newPosition.x, newPosition.y, newPosition.z);
      } else {
        sphere.position.set(newPosition.x, newPosition.y, newPosition.z);
        createParticleEffect(sphere.position);
      }

      sphere.userData = post;
      sceneRef.current.add(sphere);
      return sphere;
    });

    updateConnections();
  }, [debug, filterPostsByTime, timeFilter, categoryVisibility, searchTerm, createParticleEffect, updateConnections]);


const fetchRSSFeed = async (feed: RSSFeed): Promise<Post[]> => {
  try {
    const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`);
    const data = await response.json();
    if (data.status !== 'ok' || !Array.isArray(data.items)) {
      console.error('Invalid RSS feed data:', data);
      return [];
    }
    return data.items.map((item: any) => ({
      id: item.guid || item.link,
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      category: feed.category,
      engagement: Math.floor(Math.random() * 100)
    }));
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    return [];
  }
};



  useEffect(() => {
    debug("Component mounted");
    const fetchRSSFeed = (feed: RssFeed): Promise<any[]> => {
      debug("Fetching RSS feed: " + feed.url);
      return fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`)
        .then(response => response.json())
        .then(data => {
          if (data.status !== 'ok' || !Array.isArray(data.items)) {
            console.error('Invalid RSS feed data:', data);
            return [];
          }
          return data.items.map((item: any) => {
            return {
              id: item.guid || item.link,
              title: item.title,
              link: item.link,
              pubDate: item.pubDate,
              category: feed.category,
              engagement: Math.floor(Math.random() * 100)
            };
          });
        })
        .catch((error) => {
          console.error('Error fetching RSS feed:', error);
          return [];
        });
    }

    const fetchAllFeeds = () => {
      debug("Fetching all feeds");
      Promise.all(RSS_FEEDS.map(fetchRSSFeed))
        .then((allPosts) => {
          const newPosts = allPosts.flat();
          debug("Total posts fetched: " + newPosts.length);
          setPosts((prevPosts) => {
            updateVisualization(prevPosts, newPosts);
            return newPosts;
          });
        });
    }

    fetchAllFeeds();
    const interval = setInterval(fetchAllFeeds, 60000);

    return () => {
      debug("Component unmounting");
      clearInterval(interval);
    };
  }, [debug, updateVisualization]);

  useEffect(() => {
    if (!mountRef.current || posts.length === 0) return;
    debug("Setting up Three.js scene");

    const mount = mountRef.current;
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    controls.addEventListener('start', () => {
      setAutoRotate(false);
      controls.autoRotate = false;
    });

    controls.addEventListener('end', () => {
      setAutoRotate(true);
      controls.autoRotate = true;
    });

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    scene.add(directionalLight);

    updateVisualization([], posts);

    camera.position.z = 200;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(spheresRef.current);

      if (intersects.length > 0) {
        const post = intersects[0].object.userData;
        setTooltip({
          content: `
            <strong>${post.title}</strong><br>
            Category: ${post.category}<br>
            Published: ${new Date(post.pubDate).toLocaleString()}<br>
            Engagement: ${post.engagement}
          `,
          x: event.clientX,
          y: event.clientY
        });
        document.body.style.cursor = 'pointer';

        spheresRef.current.forEach((sphere) => {
          if (sphere.userData.category === post.category || 
              new Date(sphere.userData.pubDate).toDateString() === new Date(post.pubDate).toDateString()) {
            sphere.material.emissive.setHex(0x00ff00);
          } else {
            sphere.material.emissive.setHex(0x000000);
          }
        });
      } else {
        setTooltip(null);
        document.body.style.cursor = 'default';
        spheresRef.current.forEach((sphere) => {
          sphere.material.emissive.setHex(0x000000);
        });
      }
    }

    window.addEventListener('mousemove', onMouseMove);

    const updateBackgroundColor = () => {
      const now = new Date();
      const hours = now.getHours();
      const nightColor = new THREE.Color(0x001a33);
      const dayColor = new THREE.Color(0x001a33);
      const t = Math.sin((hours / 24) * Math.PI);
      const color = new THREE.Color().lerpColors(nightColor, dayColor, t);
      scene.background = color;
    }

    const animate = () => {
      requestAnimationFrame(animate);
      
      spheresRef.current.forEach((sphere) => {
        sphere.scale.x = sphere.scale.y = sphere.scale.z = 
          1 + 0.1 * Math.sin(Date.now() * 0.001 + sphere.position.x);
      });

      controls.update();
      updateBackgroundColor();
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', handleResize);

    return () => {
      debug("Cleaning up Three.js scene");
      if (mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [posts, debug, updateVisualization]);

  useEffect(() => {
    if (posts.length > 0) {
      updateVisualization(posts, posts);
    }
  }, [timeFilter, searchTerm, categoryVisibility, updateVisualization, posts]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      
      <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.7)', padding: 10, borderRadius: 5 }}>
        {Object.entries(COLORS).map(([category, color]) => (
          <div key={category} style={{ display: 'flex', alignItems: 'center', marginBottom: 5 }}>
            <div style={{ width: 20, height: 20, background: '#' + color.toString(16).padStart(6, '0'), marginRight: 10 }}></div>
            <span style={{ color: 'white' }}>{category}</span>
          </div>
        ))}
      </div>

      <div style={{ position: 'absolute', top: 10, right: 10 }}>
        <button onClick={() => setTimeFilter('all')}>All Time</button>
        <button onClick={() => setTimeFilter('week')}>Last Week</button>
        <button onClick={() => setTimeFilter('day')}>Last Day</button>
        <button onClick={() => setTimeFilter('hour')}>Last Hour</button>
      </div>

      <div style={{ position: 'absolute', top: 50, right: 10 }}>
        <input 
          type="text" 
          placeholder="Search posts..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div style={{ position: 'absolute', bottom: 10, left: 10 }}>
        {Object.keys(categoryVisibility).map((category) => {
          return (
            <button 
              key={category} 
              onClick={() => setCategoryVisibility(prev => ({ ...prev, [category]: !prev[category] }))}
              style={{
                margin: '0 5px',
                padding: '5px 10px',
                backgroundColor: categoryVisibility[category] ? COLORS[category] : '#ccc',
                color: 'navy',
                border: 'none',
                borderRadius: '0px',
                cursor: 'pointer'
              }}
            >
              {categoryVisibility[category] ? 'Hide' : 'Show'} {category}
            </button>
          );
        })}
      </div>

        <button
        style={{
          position: 'absolute',
          top: '90px',
          right: '10px',
          padding: '5px 10px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
        onClick={() => setSettingsPanelOpen(true)}
      >
        Open Settings
      </button>

    <SettingsPanel
  isOpen={settingsPanelOpen}
  onClose={() => setSettingsPanelOpen(false)}
  autoRotate={autoRotate}
  setAutoRotate={setAutoRotate}
  rssFeeds={rssFeeds}
  setRssFeeds={setRssFeeds}
  onFeedsUpdate={() => {
    // Implement this function to refresh feeds
    console.log("Refreshing feeds");
    // You might want to call fetchAllFeeds() here
  }}
/>

      {tooltip && (
        <div
          style={{
            position: 'absolute',
            top: tooltip.y + 10,
            left: tooltip.x + 10,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '5px',
            fontSize: '14px',
            pointerEvents: 'none',
            zIndex: 1000,
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}

      <div style={{ position: 'absolute', bottom: 10, right: 10, color: 'white', backgroundColor: 'rgba(0,0,0,0.7)', padding: '5px', borderRadius: '5px' }}>
        Posts: {posts.length} | Visible: {spheresRef.current.length}
      </div>
    </div>
  );
};

export default SocialMediaVisualization;