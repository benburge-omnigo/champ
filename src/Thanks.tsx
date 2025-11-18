import React from 'react';
import teamImg from './assets/team.png';
// Signature font import
const signatureFontUrl = 'https://fonts.googleapis.com/css2?family=Pacifico&display=swap';

const Thanks: React.FC = () => {
  React.useEffect(() => {
    const link = document.createElement('link');
    link.href = signatureFontUrl;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);
  return (
    <div style={{
      margin: '4rem auto',
      maxWidth: '700px',
      background: '#f3f4f6',
      borderRadius: '1.5rem',
      boxShadow: '0 4px 24px rgba(99,102,241,0.10)',
      padding: '2.5rem',
      textAlign: 'center',
      position: 'relative',
    }}>
      {/* Team image section */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <img
          src={teamImg}
          alt="Team helping cross the finish line"
          style={{
            maxWidth: '420px',
            width: '100%',
            borderRadius: '1.2rem',
            boxShadow: '0 6px 32px rgba(99,102,241,0.18)',
            border: '4px solid #6366f1',
            objectFit: 'cover',
          }}
        />
      </div>
      <h2 style={{ color: '#6366f1', fontWeight: 700, fontSize: '2.5rem', marginBottom: '1.5rem' }}>
        Thank You, Team!
      </h2>
      <p style={{ fontSize: '1.3rem', color: '#334155', marginBottom: '1.5rem' }}>
        I want to start by saying how much I appreciate receiving this award. But I also want to take this time to recognize that most of these accomplishments are not mine alone—it is through the strength of the team that I work with. This is what gives me the ability to focus on new ideas and push the envelope with POCs. Our team’s dedication, resilience, and wisdom to reach out when more effort is needed are what make all of this possible. In my mind, this award truly belongs to the team as a whole. Thank you for your support, your hard work, and for inspiring me every day.
      </p>
      <div style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '2rem' }}>
        Let’s keep pushing boundaries and building great things together!
      </div>
      <div style={{ fontSize: '1.15rem', color: '#6366f1', fontWeight: 600, marginTop: '2rem', marginBottom: '0.5rem' }}>
        Special Thanks To:
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.2rem', marginBottom: '1.5rem' }}>
        {/* ...existing code for team members... */}
        {[
          { name: 'Phil H.' },
          { name: 'Todd H.' },
          { name: 'Chris R.' },
          { name: 'Eugene K.' },
          { name: 'Tiago L.' },
          { name: 'Jeff T.' },
          { name: 'Kevin B.' },
          { name: 'Elizabeth F.' },
        ].map((person) => (
          <div key={person.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '70px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#6366f1',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.35rem',
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(99,102,241,0.10)',
              marginBottom: '0.5rem',
              border: '3px solid #e0e7ff',
            }}>
              {person.name.split(' ').map(n => n[0]).join('')}
            </div>
            <span style={{ fontSize: '1rem', color: '#334155', fontWeight: 500 }}>{person.name}</span>
          </div>
        ))}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '70px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#e0e7ff',
            color: '#6366f1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.35rem',
            fontWeight: 700,
            boxShadow: '0 2px 8px rgba(99,102,241,0.10)',
            marginBottom: '0.5rem',
            border: '3px solid #6366f1',
          }}>
            ...
          </div>
          <span style={{ fontSize: '1rem', color: '#334155', fontWeight: 500 }}>All those I work with day to day</span>
        </div>
      </div>
      <div style={{ marginTop: '2.5rem', fontSize: '1.35rem', color: '#6366f1', textAlign: 'center', fontFamily: 'Pacifico, cursive', letterSpacing: '1px' }}>
        — Benjamin Burge, your Oct 2025 Champion
      </div>
    </div>
  );
};

export default Thanks;
