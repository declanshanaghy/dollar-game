import React, { useEffect, useRef } from 'react';

interface StarburstAnimationProps {
  centerX: number;
  centerY: number;
}

// Ultra-optimized starburst animation using canvas instead of SVG
const StarburstAnimation: React.FC<StarburstAnimationProps> = ({ centerX, centerY }) => {
  const canvasRef = useRef<SVGForeignObjectElement>(null);
  
  useEffect(() => {
    // Create a canvas element for better performance
    const foreignObject = canvasRef.current;
    if (!foreignObject) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 450;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    
    foreignObject.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Pre-defined colors for better performance
    const colors = ['#f5c2e7', '#cba6f7', '#89dceb', '#a6e3a1', '#f9e2af'];
    
    // Create a fixed number of particles
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      life: number;
      maxLife: number;
    }> = [];
    
    // Create only 50 initial particles
    for (let i = 0; i < 50; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      
      particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0,
        maxLife: 40 + Math.random() * 40
      });
    }
    
    // Animation start time
    const startTime = Date.now();
    const duration = 10000; // 10 seconds
    
    // Pre-calculate some values for better performance
    const PI2 = Math.PI * 2;
    
    // Use a fixed frame rate for better performance
    let lastFrameTime = 0;
    const targetFPS = 30; // Lower FPS for better performance
    const frameInterval = 1000 / targetFPS;
    
    // Animation function with frame rate limiting
    const animate = (timestamp: number) => {
      // Calculate elapsed time since animation started
      const elapsed = Date.now() - startTime;
      
      // Check if animation should stop
      if (elapsed > duration) {
        // Animation complete, clean up
        if (foreignObject.contains(canvas)) {
          foreignObject.removeChild(canvas);
        }
        return;
      }
      
      // Frame rate limiting
      const deltaTime = timestamp - lastFrameTime;
      if (deltaTime < frameInterval) {
        requestAnimationFrame(animate);
        return;
      }
      lastFrameTime = timestamp - (deltaTime % frameInterval);
      
      // Clear canvas with transparent background
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Batch drawing for better performance
      ctx.save();
      
      // Update and draw particles in a single pass
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Update position with simplified physics
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.vy += 0.01;
        p.life++;
        
        // Calculate opacity
        const opacity = 1 - (p.life / p.maxLife);
        
        // Only draw if visible
        if (opacity > 0.05) {
          ctx.globalAlpha = opacity;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, PI2);
          ctx.fill();
        }
        
        // Reset particle if it's dead
        if (p.life >= p.maxLife) {
          // Only reset if we're still within the animation duration
          if (elapsed < duration - 1000) {
            const angle = Math.random() * PI2;
            const speed = 1 + Math.random() * 2;
            
            p.x = centerX + (Math.random() * 80 - 40);
            p.y = centerY + (Math.random() * 80 - 40);
            p.vx = Math.cos(angle) * speed;
            p.vy = Math.sin(angle) * speed;
            p.life = 0;
            p.maxLife = 30 + Math.random() * 30;
          }
        }
      }
      
      ctx.restore();
      
      // Request next frame
      requestAnimationFrame(animate);
    };
    
    // Start animation with current timestamp
    requestAnimationFrame(animate);
    
    // Cleanup function
    return () => {
      if (foreignObject.contains(canvas)) {
        foreignObject.removeChild(canvas);
      }
    };
  }, [centerX, centerY]);
  
  return (
    <foreignObject
      ref={canvasRef}
      x={centerX - 400}
      y={centerY - 225}
      width={800}
      height={450}
    />
  );
};

export default StarburstAnimation;