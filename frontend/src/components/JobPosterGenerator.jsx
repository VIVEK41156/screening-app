import React, { useRef, useEffect } from 'react';

const LOGO_URL = 'https://evalright.us/wp-content/uploads/2024/08/EvalRight-PNG-AI-2048x853.png';

const JobPosterGenerator = ({ job, onClose }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!job) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const W = 1080, H = 1080;
        canvas.width = W;
        canvas.height = H;

        // Background gradient
        const bg = ctx.createLinearGradient(0, 0, W, H);
        bg.addColorStop(0, '#0f0f1a');
        bg.addColorStop(0.5, '#1a1432');
        bg.addColorStop(1, '#0f0f1a');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        // Decorative circles
        const drawCircle = (x, y, r, color) => {
            ctx.save();
            ctx.globalAlpha = 0.08;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.restore();
        };
        drawCircle(950, 150, 320, '#4B3C8C');
        drawCircle(100, 950, 280, '#3A2E6F');
        drawCircle(500, 500, 400, '#4B3C8C');

        // Top accent bar
        const accentGrad = ctx.createLinearGradient(0, 0, W, 0);
        accentGrad.addColorStop(0, '#4B3C8C');
        accentGrad.addColorStop(1, '#C9C8E8');
        ctx.fillStyle = accentGrad;
        ctx.fillRect(0, 0, W, 8);

        // Glass card background
        ctx.save();
        ctx.globalAlpha = 0.07;
        ctx.fillStyle = '#FFFFFF';
        roundRect(ctx, 60, 80, W - 120, H - 160, 28);
        ctx.fill();
        ctx.restore();

        // Card border
        ctx.save();
        ctx.globalAlpha = 0.15;
        ctx.strokeStyle = '#C9C8E8';
        ctx.lineWidth = 1.5;
        roundRect(ctx, 60, 80, W - 120, H - 160, 28);
        ctx.stroke();
        ctx.restore();

        // "WE'RE HIRING" badge
        ctx.save();
        const badgeGrad = ctx.createLinearGradient(350, 130, 730, 130);
        badgeGrad.addColorStop(0, '#4B3C8C');
        badgeGrad.addColorStop(1, '#3A2E6F');
        ctx.fillStyle = badgeGrad;
        roundRect(ctx, 380, 118, 320, 44, 22);
        ctx.fill();
        ctx.restore();
        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = '#C9C8E8';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ WE\'RE HIRING', W / 2, 146);

        // Job Title
        ctx.font = 'bold 72px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        const title = job.title || 'Job Opening';
        // Word wrap for long titles
        wrapText(ctx, title, W / 2, 260, W - 160, 82);

        // Divider line
        const divGrad = ctx.createLinearGradient(120, 0, W - 120, 0);
        divGrad.addColorStop(0, 'transparent');
        divGrad.addColorStop(0.5, '#C9C8E8');
        divGrad.addColorStop(1, 'transparent');
        ctx.strokeStyle = divGrad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(120, 370);
        ctx.lineTo(W - 120, 370);
        ctx.stroke();

        // Details row (location, experience, salary)
        const details = [
            { icon: '📍', label: job.location || 'Remote' },
            { icon: '⏱', label: `${job.experience}+ yrs exp` },
            { icon: '💰', label: job.salary_range || 'Competitive' },
        ];
        details.forEach((d, i) => {
            const x = 200 + i * 340;
            ctx.font = '28px Arial';
            ctx.fillStyle = '#9ca3af';
            ctx.textAlign = 'center';
            ctx.fillText(d.icon, x, 430);
            ctx.font = 'bold 22px Arial';
            ctx.fillStyle = '#C9C8E8';
            ctx.fillText(d.label, x, 465);
        });

        // Skills section
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#9ca3af';
        ctx.textAlign = 'center';
        ctx.fillText('REQUIRED SKILLS', W / 2, 540);

        const skills = (job.skills || '').split(',').map(s => s.trim()).filter(Boolean).slice(0, 6);
        const skillsPerRow = Math.min(3, skills.length);
        skills.forEach((skill, i) => {
            const row = Math.floor(i / skillsPerRow);
            const col = i % skillsPerRow;
            const totalInRow = Math.min(skillsPerRow, skills.length - row * skillsPerRow);
            const startX = W / 2 - (totalInRow * 220) / 2 + 110;
            const x = startX + col * 220;
            const y = 575 + row * 65;

            // Pill background
            ctx.save();
            ctx.globalAlpha = 0.25;
            ctx.fillStyle = '#4B3C8C';
            roundRect(ctx, x - 90, y - 28, 180, 44, 22);
            ctx.fill();
            ctx.restore();
            ctx.save();
            ctx.globalAlpha = 0.4;
            ctx.strokeStyle = '#C9C8E8';
            ctx.lineWidth = 1;
            roundRect(ctx, x - 90, y - 28, 180, 44, 22);
            ctx.stroke();
            ctx.restore();
            ctx.font = 'bold 18px Arial';
            ctx.fillStyle = '#C9C8E8';
            ctx.textAlign = 'center';
            ctx.fillText(skill, x, y);
        });

        // Apply Now section
        const applyY = skills.length > 3 ? 800 : 740;

        ctx.font = 'bold 26px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText('APPLY NOW', W / 2, applyY);

        // Apply link box
        const applyLink = `screening-backend.onrender.com/apply/${job.id}`;
        ctx.save();
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = '#C9C8E8';
        roundRect(ctx, 200, applyY + 15, W - 400, 50, 25);
        ctx.fill();
        ctx.restore();
        ctx.font = '20px Arial';
        ctx.fillStyle = '#C9C8E8';
        ctx.textAlign = 'center';
        ctx.fillText(applyLink, W / 2, applyY + 46);

        // Bottom logo area
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        logoImg.onload = () => {
            // Logo (white filter applied via canvas)
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            const logoW = 280, logoH = logoW * (853 / 2048);
            ctx.drawImage(logoImg, W / 2 - logoW / 2, H - 120, logoW, logoH);
            ctx.restore();
        };
        logoImg.onerror = () => {
            // Fallback text if logo fails to load
            ctx.font = 'bold 22px Arial';
            ctx.fillStyle = '#C9C8E8';
            ctx.textAlign = 'center';
            ctx.globalAlpha = 0.5;
            ctx.fillText('EvalRight · AI-Powered Recruitment', W / 2, H - 85);
        };
        logoImg.src = LOGO_URL;

        // Bottom accent bar
        const bottomGrad = ctx.createLinearGradient(0, 0, W, 0);
        bottomGrad.addColorStop(0, '#4B3C8C');
        bottomGrad.addColorStop(1, '#C9C8E8');
        ctx.fillStyle = bottomGrad;
        ctx.fillRect(0, H - 8, W, 8);

    }, [job]);

    const handleDownload = () => {
        const canvas = canvasRef.current;
        const link = document.createElement('a');
        link.download = `${job?.title?.replace(/\s+/g, '_') || 'job'}_poster.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const shareToLinkedIn = () => {
        const url = encodeURIComponent(`https://screening-backend.onrender.com/apply/${job.id}`);
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
    };

    const shareToFacebook = () => {
        const url = encodeURIComponent(`https://screening-backend.onrender.com/apply/${job.id}`);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: '20px', border: '1px solid var(--border-light)', width: '100%', maxWidth: 900, maxHeight: '90vh', overflow: 'auto', padding: '2rem' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>📢 Job Poster Ready</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>Download and share on social media</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '0.5rem 1rem', color: 'white', cursor: 'pointer' }}>✕ Close</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', alignItems: 'start' }}>
                    {/* Canvas Preview */}
                    <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                        <canvas ref={canvasRef} style={{ width: '100%', display: 'block' }} />
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 200 }}>
                        <button onClick={handleDownload}
                            style={{ padding: '0.875rem 1.25rem', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', fontFamily: 'var(--font-body)', boxShadow: '0 4px 14px rgba(75,60,140,0.4)' }}>
                            ⬇️ Download Poster
                        </button>

                        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textAlign: 'center' }}>SHARE APPLY LINK</p>
                            <button onClick={shareToLinkedIn}
                                style={{ width: '100%', padding: '0.75rem', background: '#0077B5', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.5rem', fontFamily: 'var(--font-body)' }}>
                                in Post on LinkedIn
                            </button>
                            <button onClick={shareToFacebook}
                                style={{ width: '100%', padding: '0.75rem', background: '#1877F2', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem', fontFamily: 'var(--font-body)' }}>
                                f Post on Facebook
                            </button>
                        </div>

                        <div style={{ background: 'var(--bg-glass)', borderRadius: '10px', padding: '1rem', border: '1px solid var(--border-light)' }}>
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                                💡 <strong>Tip:</strong> Download the poster first, then upload it as an image when creating your LinkedIn or Facebook post for maximum visibility!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helpers
function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        if (ctx.measureText(testLine).width > maxWidth && n > 0) {
            ctx.fillText(line, x, currentY);
            line = words[n] + ' ';
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, currentY);
}

export default JobPosterGenerator;
