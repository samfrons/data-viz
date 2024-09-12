import React, { useState, useEffect } from 'react';

import * as THREE from 'three';


const Mfc1: FC = () => {

let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, mfc: THREE.Group;
let electrons: THREE.Mesh[] = [], algaeCells: THREE.Mesh[] = [], co2Molecules: THREE.Mesh[] = [];
let currentDensity: number = 0, voltage: number = 0, powerDensity: number = 0, co2Captured: number = 0;
const maxCurrentDensity: number = 2; // mA/cm²
const internalResistance: number = 200; // ohms
const openCircuitVoltage: number = 0.7; // V
const electrodeArea: number = 10; // cm²

function init(): void {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    mfc = new THREE.Group();

    const anodeChamber: THREE.Mesh = new THREE.Mesh(
        new THREE.BoxGeometry(4, 3, 2),
        new THREE.MeshPhysicalMaterial({
            color: 0x8B4513,
            transparent: true,
            opacity: 0.3,
            roughness: 0.5,
            metalness: 0.1,
            transmission: 0.6
        })
    );
    anodeChamber.position.x = -2;
    mfc.add(anodeChamber);

    const cathodeChamber: THREE.Mesh = new THREE.Mesh(
        new THREE.BoxGeometry(4, 3, 2),
        new THREE.MeshPhysicalMaterial({
            color: 0x4682B4,
            transparent: true,
            opacity: 0.3,
            roughness: 0.5,
            metalness: 0.1,
            transmission: 0.6
        })
    );
    cathodeChamber.position.x = 2;
    mfc.add(cathodeChamber);

    const pem: THREE.Mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.1, 3, 2),
        new THREE.MeshBasicMaterial({ color: 0xFFFF00, transparent: true, opacity: 0.5 })
    );
    mfc.add(pem);

    const anodeGeometry: THREE.BoxGeometry = new THREE.BoxGeometry(0.05, 2.5, 1.5);
    const anodeMaterial: THREE.MeshPhysicalMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x333333,
        metalness: 0.8,
        roughness: 0.2,
        transparent: true,
        opacity: 0.8
    });
    const anode: THREE.Mesh = new THREE.Mesh(anodeGeometry, anodeMaterial);
    anode.position.x = -3.5;
    mfc.add(anode);

    const cathodeGeometry: THREE.BoxGeometry = new THREE.BoxGeometry(0.05, 2.5, 1.5);
    const cathodeMaterial: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({
        color: 0xE5E4E2,
        metalness: 0.9,
        roughness: 0.1
    });
    const cathode: THREE.Mesh = new THREE.Mesh(cathodeGeometry, cathodeMaterial);
    cathode.position.x = 3.5;
    mfc.add(cathode);

    scene.add(mfc);

    for (let i: number = 0; i < 50; i++) {
        addAlgaeCell();
    }

    for (let i: number = 0; i < 20; i++) {
        addCO2Molecule();
    }

    const ambientLight: THREE.AmbientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight: THREE.PointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    window.addEventListener('resize', onWindowResize);
}

function addAlgaeCell(): void {
    const algaeGeometry: THREE.SphereGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const algaeMaterial: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial({
        color: 0x00FF00,
        emissive: 0x006400,
        specular: 0x50FF50,
        shininess: 30,
        transparent: true,
        opacity: 0.8
    });
    const algaeCell: THREE.Mesh = new THREE.Mesh(algaeGeometry, algaeMaterial);
    algaeCell.position.set(
        Math.random() * 3 - 4.5,
        Math.random() * 2 - 1,
        Math.random() * 1.5 - 0.75
    );
    algaeCell.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01
    );
    mfc.add(algaeCell);
    algaeCells.push(algaeCell);
}

function addCO2Molecule(): void {
    const co2Geometry: THREE.SphereGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const co2Material: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
    const co2Molecule: THREE.Mesh = new THREE.Mesh(co2Geometry, co2Material);
    co2Molecule.position.set(
        Math.random() * 8 - 4,
        Math.random() * 5 - 2.5,
        Math.random() * 3 - 1.5
    );
    co2Molecule.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02
    );
    scene.add(co2Molecule);
    co2Molecules.push(co2Molecule);
}

function onWindowResize(): void {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(): void {
    requestAnimationFrame(animate);

    algaeCells.forEach((cell: THREE.Mesh, index: number) => {
        cell.position.add(cell.velocity);

        if (Math.abs(cell.position.x) > 3.5 || Math.abs(cell.position.y) > 1.25 || Math.abs(cell.position.z) > 0.75) {
            cell.velocity.multiplyScalar(-1);
        }

        if (Math.random() < 0.01 && currentDensity < maxCurrentDensity) {
            generateElectron(cell.position);
            currentDensity += 0.01;
        }

        if (Math.random() < 0.001 && algaeCells.length < 100) {
            addAlgaeCell();
        }
    });

    electrons.forEach((electron: THREE.Mesh, index: number) => {
        electron.position.x += 0.05;
        if (electron.position.x > 3.5) {
            mfc.remove(electron);
            electrons.splice(index, 1);
        }
    });

    co2Molecules.forEach((molecule: THREE.Mesh, index: number) => {
        molecule.position.add(molecule.velocity);

        if (Math.abs(molecule.position.x) > 4 || Math.abs(molecule.position.y) > 2.5 || Math.abs(molecule.position.z) > 1.5) {
            molecule.velocity.multiplyScalar(-1);
        }

        algaeCells.forEach((cell: THREE.Mesh) => {
            if (molecule.position.distanceTo(cell.position) < 0.15) {
                scene.remove(molecule);
                co2Molecules.splice(index, 1);
                co2Captured++;
                addCO2Molecule();
            }
        });
    });

    voltage = openCircuitVoltage - (currentDensity * electrodeArea * internalResistance / 1000);
    voltage = Math.max(0, voltage);

    powerDensity = voltage * currentDensity;

 

    currentDensity = Math.max(0, currentDensity - 0.005);

    mfc.rotation.y += 0.002;

    renderer.render(scene, camera);
}

function generateElectron(position: THREE.Vector3): void {
    const electron: THREE.Mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.03),
        new THREE.MeshBasicMaterial({ color: 0xFFFF00 })
    );
    electron.position.copy(position);
    mfc.add(electron);
    electrons.push(electron);
}

init();
animate();


  return (
    <div className="fuel-cell-simulation">
      <h1>Algae-based Microbial Fuel Cell Simulation</h1>
      <div className="simulation-data">
        <div className="data-item">
          <label>Current Density:</label>
          <span>{data.currentDensity.toFixed(2)}</span>
          <span className="unit">mA/cm²</span>
        </div>
        <div className="data-item">
          <label>Voltage:</label>
          <span>{data.voltage.toFixed(2)}</span>
          <span className="unit">V</span>
        </div>
        <div className="data-item">
          <label>Power Density:</label>
          <span>{data.powerDensity.toFixed(2)}</span>
          <span className="unit">mW/cm²</span>
        </div>
        <div className="data-item">
          <label>CO2 Captured:</label>
          <span>{data.co2Captured.toFixed(2)}</span>
          <span className="unit">units</span>
        </div>
      </div>
    </div>
  );
};

export default Mfc1;