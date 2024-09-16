import React, { useRef, useEffect, useState, useCallback, FC } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

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

interface RssItem {
  guid?: string;
  link: string;
  title: string;
  pubDate: string;
}

interface Post {
  id: string;
  title: string;
  link: string;
  pubDate: string;
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
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const spheresRef = useRef<THREE.Mesh[]>([]);
  const sceneRef = useRef<THREE.Scene | null>(null);

  const createVisualization = useCallback(() => {
    if (!sceneRef.current) return;

    spheresRef.current.forEach((sphere) => {
      sceneRef.current?.remove(sphere);
    });

    const categoryPosition: { [key: string]: THREE.Vector3 } = {
      Technology: new THREE.Vector3(-50, 50, 0),
      Business: new THREE.Vector3(50, 50, 0),
      Science: new THREE.Vector3(-50, -50, 0),
      Health: new THREE.Vector3(50, -50, 0)
    };

    spheresRef.current = posts.map((post) => {
      const radius = 2;
      const geometry = new THREE.SphereGeometry(radius, 32, 32);
      const material = new THREE.MeshPhongMaterial({ 
        color: COLORS[post.category],
        transparent: false,
        opacity: 1,
        shininess: 50,
  specular: 0x444444
      });
      const sphere = new THREE.Mesh(geometry, material);
      
      const basePosition = categoryPosition[post.category];
      const newPosition = new THREE.Vector3(
        basePosition.x + (Math.random() * 40 - 20),
        basePosition.y + (Math.random() * 40 - 20),
        basePosition.z + (Math.random() * 40 - 20)
      );

      sphere.position.set(newPosition.x, newPosition.y, newPosition.z);
      sphere.userData = post;
      sceneRef.current?.add(sphere);
      return sphere;
    });
  }, [posts]);

  useEffect(() => {
    const fetchRSSFeed = async (feed: RssFeed): Promise<Post[]> => {
      try {
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`);
        const data = await response.json();
        if (data.status !== 'ok' || !Array.isArray(data.items)) {
          console.error('Invalid RSS feed data:', data);
          return [];
        }
        return data.items.map((item: RssItem) => ({
          id: item.guid || item.link,
          title: item.title,
          link: item.link,
          pubDate: item.pubDate,
          category: feed.category,
        }));
      } catch (error) {
        console.error('Error fetching RSS feed:', error);
        return [];
      }
    };

    const fetchAllFeeds = async () => {
      const allPosts = await Promise.all(RSS_FEEDS.map(fetchRSSFeed));
      setPosts(allPosts.flat());
    };

    fetchAllFeeds();
    const interval = setInterval(fetchAllFeeds, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
  if (!mountRef.current) return;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0); // Light gray background
  sceneRef.current = scene;
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  mountRef.current.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = ;

  // Increase ambient light intensity
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  // Add a point light for more dimension
  const pointLight = new THREE.PointLight(0xffffff, 0.8);
  pointLight.position.set(200, 100, 100);
  scene.add(pointLight);

  camera.position.z = 200;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(spheresRef.current);

      if (intersects.length > 0) {
        const post = intersects[0].object.userData as Post;
        setTooltip({
          content: `
            <strong>${post.title}</strong><br>
            Category: ${post.category}<br>
            Published: ${new Date(post.pubDate).toLocaleString()}
          `,
          x: event.clientX,
          y: event.clientY
        });
      } else {
        setTooltip(null);
      }
    };

    window.addEventListener('mousemove', onMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Store mountRef.current in a variable to use in cleanup
    const currentMount = mountRef.current;

    return () => {
      if (currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    createVisualization();
  }, [posts, createVisualization]);

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

      {tooltip && (
        <div 
          className='tooltip'
          style={{
            position: 'absolute',
            top: tooltip.y + 10,
            left: tooltip.x + 10,
            backgroundColor: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            pointerEvents: 'none',
            zIndex: 1000
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
    </div>
  );
};

export default SocialMediaVisualization;