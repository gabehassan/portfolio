function umichConfetti() {
    const umichLink = document.querySelector('.umich-link');
    const rect = umichLink.getBoundingClientRect();
    
    // Create multiple Block M confetti from different points across the text
    for (let i = 0; i < 12; i++) {
        // Random position along the width and height of the text
        const randomX = rect.left + (Math.random() * rect.width);
        const randomY = rect.top + (Math.random() * rect.height);
        createBlockM(randomX, randomY);
    }
}

function justmonitorsConfetti() {
    const justmonitorsLink = document.querySelector('.justmonitors-link');
    const rect = justmonitorsLink.getBoundingClientRect();
    
    // Create multiple JustMonitors logo confetti from different points across the text
    for (let i = 0; i < 12; i++) {
        // Random position along the width and height of the text
        const randomX = rect.left + (Math.random() * rect.width);
        const randomY = rect.top + (Math.random() * rect.height);
        createJustMonitorsLogo(randomX, randomY);
    }
}

function createBlockM(startX, startY) {
    const blockM = document.createElement('div');
    
    // Bigger random size 
    const size = Math.floor(Math.random() * 8) + 12; // 12-20px (bigger)
    const isYellow = Math.random() > 0.5;
    
    // Block M SVG data - yellow or blue
    const yellowSVG = 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjEyLjM5IiB2aWV3Qm94PSIwIDAgMjk0LjMyODEyIDIxMi4zOTA2MiIgd2lkdGg9IjI5NC4zMyI+PGcgdHJhbnNmb3JtPSJtYXRyaXgoMS4yNSAwIDAgLTEuMjUgLTEyMy44NyA3ODYuMzMpIj48ZyB0cmFuc2Zvcm09Im1hdHJpeCgyLjUgMCAwIDIuNSAtMzIzLjEyIC04MTQuMzUpIj48cGF0aCBkPSJtMjM0LjQzIDU3Ni45Ny0xOC40Mi0yNS40NjctMTguMzg5IDI1LjQ2N2gtMjguMzY4di0yMC4wMTFoNy4wMjd2LTI3LjMwNGgtNy4wMjd2LTIwLjAxaDM2LjE3M3YyMC4wMWgtNy40OTV2MTUuNjdsMTcuOTgyLTI0LjcyNiAxOC4yMDcgMjQuNzQ3di0xNS42OTFoLTcuNDk1di0yMC4wMWgzNi4xNzN2MjAuMDFoLTcuMDI3djI3LjMwNGg3LjAyN3YyMC4wMTFoLTI4LjM2OHoiIGZpbGw9IiNmZmNiMDUiLz48L2c+PC9nPjwvc3ZnPg==';
    const blueSVG = 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjEyLjM5IiB2aWV3Qm94PSIwIDAgMjk0LjMyODEyIDIxMi4zOTA2MiIgd2lkdGg9IjI5NC4zMyI+PGcgdHJhbnNmb3JtPSJtYXRyaXgoMS4yNSAwIDAgLTEuMjUgLTEyMy44NyA3ODYuMzMpIj48ZyB0cmFuc2Zvcm09Im1hdHJpeCgyLjUgMCAwIDIuNSAtMzIzLjEyIC04MTQuMzUpIj48cGF0aCBkPSJtMjM0LjQzIDU3Ni45Ny0xOC40Mi0yNS40NjctMTguMzg5IDI1LjQ2N2gtMjguMzY4di0yMC4wMTFoNy4wMjd2LTI3LjMwNGgtNy4wMjd2LTIwLjAxaDM2LjE3M3YyMC4wMWgtNy40OTV2MTUuNjdsMTcuOTgyLTI0LjcyNiAxOC4yMDcgMjQuNzQ3di0xNS42OTFoLTcuNDk1di0yMC4wMWgzNi4xNzN2MjAuMDFoLTcuMDI3djI3LjMwNGg3LjAyN3YyMC4wMTFoLTI4LjM2OHoiIGZpbGw9IiMwMDI3NGMiLz48L2c+PC9nPjwvc3ZnPg==';
    
    const svgData = isYellow ? yellowSVG : blueSVG;
    
    blockM.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size * 0.75}px;
        background-image: url('data:image/svg+xml;base64,${svgData}');
        background-size: contain;
        background-repeat: no-repeat;
        z-index: 10000;
        left: ${startX}px;
        top: ${startY}px;
        transform: translate(-50%, -50%);
        pointer-events: none;
    `;
    
    document.body.appendChild(blockM);
    
    // Sunrise semicircle - upward and outward like a fan
    const angle = Math.random() * Math.PI; // 0 to 180 degrees
    const velocity = Math.random() * 120 + 100; // Higher velocity for better arc
    let vx = Math.cos(angle) * velocity; // X velocity (left to right spread)
    let vy = -Math.sin(angle) * velocity; // Y velocity (negative = upward)
    let x = 0;
    let y = 0;
    let rotation = 0;
    const rotationSpeed = (Math.random() - 0.5) * 180; // Less rotation
    
    const startTime = Date.now();
    
    function animate() {
        const elapsed = (Date.now() - startTime) / 1000;
        
        // Update position with natural gravity
        x += vx * 0.016;
        y += vy * 0.016;
        vy += 200 * 0.016; // Gravity pulls them down naturally
        rotation += rotationSpeed * 0.016;
        
        // Update element position
        blockM.style.left = (startX + x) + 'px';
        blockM.style.top = (startY + y) + 'px';
        blockM.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
        blockM.style.opacity = Math.max(0, 1 - elapsed / 2.5); // Fade slower to match duration
        
        // Let them explode in all directions
        if (elapsed < 2.5 && Math.abs(x) < 300 && Math.abs(y) < 300) { // Stop when they get too far in any direction
            requestAnimationFrame(animate);
        } else {
            blockM.remove();
        }
    }
    
    requestAnimationFrame(animate);
}

function createJustMonitorsLogo(startX, startY) {
    const logo = document.createElement('div');
    
    // Random size for the logo (bigger than Block M)
    const size = Math.floor(Math.random() * 20) + 26; // 20-32px
    
    logo.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        background-image: url('assets/justmonitors.png');
        background-size: contain;
        background-repeat: no-repeat;
        z-index: 10000;
        left: ${startX}px;
        top: ${startY}px;
        transform: translate(-50%, -50%);
        pointer-events: none;
    `;
    
    document.body.appendChild(logo);
    
    // Same animation as Block M - sunrise semicircle
    const angle = Math.random() * Math.PI; // 0 to 180 degrees
    const velocity = Math.random() * 120 + 100; // Higher velocity for better arc
    let vx = Math.cos(angle) * velocity; // X velocity (left to right spread)
    let vy = -Math.sin(angle) * velocity; // Y velocity (negative = upward)
    let x = 0;
    let y = 0;
    let rotation = 0;
    const rotationSpeed = (Math.random() - 0.5) * 180; // Less rotation
    
    const startTime = Date.now();
    
    function animate() {
        const elapsed = (Date.now() - startTime) / 1000;
        
        // Update position with natural gravity
        x += vx * 0.016;
        y += vy * 0.016;
        vy += 200 * 0.016; // Gravity pulls them down naturally
        rotation += rotationSpeed * 0.016;
        
        // Update element position
        logo.style.left = (startX + x) + 'px';
        logo.style.top = (startY + y) + 'px';
        logo.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
        logo.style.opacity = Math.max(0, 1 - elapsed / 2.5); // Fade slower to match duration
        
        // Let them explode in all directions
        if (elapsed < 2.5 && Math.abs(x) < 300 && Math.abs(y) < 300) { // Stop when they get too far in any direction
            requestAnimationFrame(animate);
        } else {
            logo.remove();
        }
    }
    
    requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', () => {
    const umichLink = document.querySelector('.umich-link');
    const justmonitorsLink = document.querySelector('.justmonitors-link');
    
    let pageLoadTime = Date.now();
    let hasUserInteracted = false;
    
    document.addEventListener('touchstart', () => { hasUserInteracted = true; }, { once: true });
    document.addEventListener('click', () => { hasUserInteracted = true; }, { once: true });
    
    if (umichLink) {
        umichLink.addEventListener('mouseenter', () => {
            const timeSinceLoad = Date.now() - pageLoadTime;
            if (timeSinceLoad < 1000 && !hasUserInteracted) return;
            umichConfetti();
        });
    }
    
    if (justmonitorsLink) {
        justmonitorsLink.addEventListener('mouseenter', () => {
            const timeSinceLoad = Date.now() - pageLoadTime;
            if (timeSinceLoad < 1000 && !hasUserInteracted) return;
            justmonitorsConfetti();
        });
    }
});