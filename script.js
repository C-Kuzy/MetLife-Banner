class ParticleBackground {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 80;
        this.connectionDistance = 150;
        this.mousePosition = { x: null, y: null };
        this.colors = [
            'rgba(0, 163, 224, 0.8)',
            'rgba(122, 184, 0, 0.8)',
            'rgba(255, 255, 255, 0.7)'
        ];
        
        this.init();
        this.animate();
        this.setupMouseTracking();
    }

    init() {
        this.canvas.width = 1200;
        this.canvas.height = 628;

        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 3 + 2,
                color: this.colors[Math.floor(Math.random() * this.colors.length)]
            });
        }
    }

    setupMouseTracking() {
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.addEventListener('mousemove', (e) => {
            this.mousePosition.x = e.clientX - rect.left;
            this.mousePosition.y = e.clientY - rect.top;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.mousePosition.x = this.mousePosition.y = null;
        });
    }

    update() {
        const { x: mouseX, y: mouseY } = this.mousePosition;
        const hasMousePos = mouseX !== null;
        
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;

            if (hasMousePos) {
                const dx = mouseX - particle.x;
                const dy = mouseY - particle.y;
                const distSq = dx * dx + dy * dy;
                
                if (distSq < 10000) {
                    particle.vx += dx * 0.0002;
                    particle.vy += dy * 0.0002;
                }
            }

            if (particle.x < 0) particle.x = this.canvas.width;
            else if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            else if (particle.y > this.canvas.height) particle.y = 0;

            const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
            if (speed > 1) {
                const scale = 1 / speed;
                particle.vx *= scale;
                particle.vy *= scale;
            }
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const maxDist = this.connectionDistance;
        const maxDistSq = maxDist * maxDist;

        this.ctx.lineWidth = 1;
        this.particles.forEach((particle, i) => {
            for (let j = i + 1; j < this.particles.length; j++) {
                const other = this.particles[j];
                const dx = particle.x - other.x;
                const dy = particle.y - other.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < maxDistSq) {
                    const dist = Math.sqrt(distSq);
                    const opacity = (1 - dist / maxDist) * 0.5;
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(other.x, other.y);
                    this.ctx.stroke();
                }
            }
        });

        this.particles.forEach(particle => {
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = particle.color;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.shadowBlur = 0;

        const { x: mouseX, y: mouseY } = this.mousePosition;
        if (mouseX !== null) {
            this.particles.forEach(particle => {
                const dx = mouseX - particle.x;
                const dy = mouseY - particle.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < maxDistSq) {
                    const dist = Math.sqrt(distSq);
                    const opacity = (1 - dist / maxDist) * 0.5;
                    this.ctx.strokeStyle = `rgba(122, 184, 0, ${opacity})`;
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(mouseX, mouseY);
                    this.ctx.stroke();
                }
            });
        }
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('particleCanvas');
    if (canvas) new ParticleBackground(canvas);
    
    setTimeout(addFloatingShapes, 2000);
});

function addFloatingShapes() {
    const container = document.querySelector('.container');
    if (!container) return;
    
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < 5; i++) {
        const shape = document.createElement('div');
        shape.style.cssText = `
            position: absolute;
            width: ${Math.random() * 30 + 10}px;
            height: ${Math.random() * 30 + 10}px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${Math.random() * 10 + 15}s ease-in-out infinite;
            animation-delay: ${Math.random() * -10}s;
            z-index: 2;
        `;
        fragment.appendChild(shape);
    }
    
    container.appendChild(fragment);
    
    if (!document.querySelector('#floatKeyframes')) {
        const style = document.createElement('style');
        style.id = 'floatKeyframes';
        style.textContent = `@keyframes float {
            0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.3; }
            25% { transform: translate(50px, -30px) rotate(90deg); opacity: 0.5; }
            50% { transform: translate(-30px, 50px) rotate(180deg); opacity: 0.3; }
            75% { transform: translate(30px, 30px) rotate(270deg); opacity: 0.5; }
        }`;
        document.head.appendChild(style);
    }
}
