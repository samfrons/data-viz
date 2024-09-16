import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const sampleMovieData = [
  { title: "2012", year: 2009, disasterType: "Natural Disaster", ratings: 539000, rating: 5.8 },
  { title: "Contagion", year: 2011, disasterType: "Pandemic", ratings: 484000, rating: 6.8 },
  { title: "The Day After Tomorrow", year: 2004, disasterType: "Natural Disaster", ratings: 438000, rating: 6.4 },
  { title: "World War Z", year: 2013, disasterType: "Pandemic", ratings: 624000, rating: 7.0 },
  { title: "Mad Max: Fury Road", year: 2015, disasterType: "Post-Apocalyptic", ratings: 935000, rating: 8.1 },
  { title: "I Am Legend", year: 2007, disasterType: "Post-Apocalyptic", ratings: 728000, rating: 7.2 },
  { title: "The Road", year: 2009, disasterType: "Post-Apocalyptic", ratings: 234000, rating: 7.2 },
  { title: "Snowpiercer", year: 2013, disasterType: "Post-Apocalyptic", ratings: 346000, rating: 7.1 },
  { title: "Children of Men", year: 2006, disasterType: "Dystopian", ratings: 481000, rating: 7.9 },
  { title: "28 Days Later", year: 2002, disasterType: "Pandemic", ratings: 399000, rating: 7.6 },
];

function createTextTexture(text) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not get 2D context');

  context.font = 'Bold 20px Arial';
  context.fillStyle = 'white';
  context.fillText(text, 0, 20);

  return new THREE.CanvasTexture(canvas);
}

function DisasterMovieVisualization() {
  const mountRef = React.useRef(null);

  React.useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();

    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Create scatter plot
    const minYear = Math.min(...sampleMovieData.map(d => d.year));
    const maxYear = Math.max(...sampleMovieData.map(d => d.year));
    const maxRatings = Math.max(...sampleMovieData.map(d => d.ratings));

    const colorMap = {
      "Natural Disaster": 0xff0000,
      "Pandemic": 0x00ff00,
      "Post-Apocalyptic": 0x0000ff,
      "Dystopian": 0xffff00,
    };

    sampleMovieData.forEach((movie) => {
      const geometry = new THREE.SphereGeometry(0.5, 32, 32);
      const material = new THREE.MeshPhongMaterial({ color: colorMap[movie.disasterType] });
      const sphere = new THREE.Mesh(geometry, material);

      const x = ((movie.year - minYear) / (maxYear - minYear)) * 100 - 50;
      const y = (movie.rating / 10) * 20 - 10;
      const z = (movie.ratings / maxRatings) * 100 - 50;

      sphere.position.set(x, y, z);
      sphere.scale.setScalar(movie.ratings / maxRatings * 2 + 0.5);
      scene.add(sphere);

      // Add movie title as label
      const textSprite = new THREE.Sprite(new THREE.SpriteMaterial({
        color: 0xffffff,
        map: createTextTexture(movie.title),
      }));
      textSprite.position.set(x, y + 2, z);
      textSprite.scale.set(5, 5, 5);
      scene.add(textSprite);
    });

    // Add axes
    const axesHelper = new THREE.AxesHelper(100);
    scene.add(axesHelper);

    // Camera position
    camera.position.set(50, 30, 100);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return React.createElement('div', { ref: mountRef });
}

export default DisasterMovieVisualization;