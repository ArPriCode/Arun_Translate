import React, { useState } from 'react';

const App = () => {
  const [enInput, setEnInput] = useState('');
  const [hiOutput, setHiOutput] = useState('');
  const [isEnLoading, setIsEnLoading] = useState(false);
  const [enError, setEnError] = useState('');

  const [hiInput, setHiInput] = useState('');
  const [enOutput, setEnOutput] = useState('');
  const [isHiLoading, setIsHiLoading] = useState(false);
  const [hiError, setHiError] = useState('');

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  const translateText = async (text, source, target, setOutput, setLoading, setError) => {
    if (!text.trim()) return;
    setLoading(true);
    setError('');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}&mt=1`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.responseData && data.responseData.translatedText) {
        // Sometimes MyMemory returns the input text if translation fails or it's already in target language
        // We ensure we don't display the input as output if they are identical (unless intended)
        if (data.responseData.translatedText.toLowerCase().trim() === text.toLowerCase().trim() && text.length > 3) {
          setError("Translation not found. Please try different words.");
          setOutput('');
        } else {
          setOutput(data.responseData.translatedText);
        }
      } else if (data.responseStatus === "403" || data.responseStatus === 403) {
        setError("Rate limit reached. Please try after 2 minutes.");
      } else {
        setError(data.responseDetails || "Translation failed.");
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.error("Translation error:", err);

      if (err.name === 'AbortError') {
        setError("Request timed out. Slow internet connection.");
      } else {
        setError(err.message === 'Failed to fetch'
          ? "Network error. Check your internet."
          : `Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    if (!text) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert("Copied to clipboard!");
      }
    } catch (err) {
      alert("Failed to copy. Please select text manually.");
    }
  };

  const clearText = (setInput, setOutput, setError) => {
    setInput('');
    setOutput('');
    setError('');
  };

  const styles = {
    wrapper: {
      padding: isMobile ? '20px 10px' : '40px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100vh',
    },
    header: {
      textAlign: 'center',
      marginBottom: isMobile ? '30px' : '50px',
      animation: 'fadeIn 0.8s ease-out',
    },
    logo: {
      fontSize: isMobile ? '2.5rem' : '3.5rem',
      fontWeight: '800',
      color: '#fff',
      textShadow: '0 4px 12px rgba(0,0,0,0.2)',
      letterSpacing: '-1px',
      marginBottom: '10px',
    },
    subtitle: {
      color: 'rgba(255,255,255,0.9)',
      fontSize: isMobile ? '1rem' : '1.2rem',
      fontWeight: '400',
    },
    container: {
      width: '100%',
      maxWidth: '1100px',
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(450px, 1fr))',
      gap: isMobile ? '20px' : '30px',
      animation: 'fadeIn 1s ease-out forwards',
    },
    card: {
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(12px)',
      borderRadius: '24px',
      padding: isMobile ? '20px' : '30px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid rgba(255,255,255,0.3)',
      transition: 'transform 0.3s ease',
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
    },
    langLabel: {
      fontSize: '1.2rem',
      fontWeight: '700',
      color: '#475569',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    textarea: {
      width: '100%',
      minHeight: '180px',
      padding: '20px',
      borderRadius: '16px',
      border: '2px solid rgba(0,0,0,0.05)',
      background: 'rgba(255,255,255,0.5)',
      fontSize: '1.2rem',
      lineHeight: '1.6',
      resize: 'none',
      color: '#1e293b',
      outline: 'none',
      marginBottom: '20px',
    },
    actionRow: {
      display: 'flex',
      gap: '12px',
      marginBottom: '25px',
    },
    mainBtn: {
      flex: 2,
      background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
      color: '#fff',
      padding: '14px',
      borderRadius: '12px',
      border: 'none',
      fontSize: '1.1rem',
      fontWeight: '600',
      cursor: 'pointer',
      boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
    },
    clearBtn: {
      flex: 1,
      background: '#f1f5f9',
      color: '#64748b',
      padding: '14px',
      borderRadius: '12px',
      border: 'none',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
    },
    outputSection: {
      marginTop: 'auto',
    },
    outputHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '10px',
    },
    outputBox: {
      width: '100%',
      minHeight: '120px',
      padding: '20px',
      borderRadius: '16px',
      background: 'rgba(0,0,0,0.03)',
      border: '2px dashed rgba(0,0,0,0.1)',
      fontSize: '1.3rem',
      color: '#0f172a',
      fontWeight: '500',
      whiteSpace: 'pre-wrap',
      position: 'relative',
    },
    copyBtn: {
      background: 'transparent',
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      padding: '6px 12px',
      fontSize: '0.85rem',
      color: '#64748b',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    error: {
      background: '#fee2e2',
      color: '#dc2626',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '0.9rem',
      marginBottom: '15px',
      border: '1px solid #fecaca',
    }
  };

  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <h1 style={styles.logo}>TranslateX</h1>
        <p style={styles.subtitle}>Supercharge your connection with India 🇮🇳</p>
      </header>

      <main style={styles.container}>
        {/* Section 1: English -> Hindi */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.langLabel}>🇬🇧 English</span>
            <span style={{ color: '#94a3b8' }}>→</span>
            <span style={styles.langLabel}>🇮🇳 Hindi</span>
          </div>

          <textarea
            style={styles.textarea}
            placeholder="Type something in English..."
            value={enInput}
            onChange={(e) => setEnInput(e.target.value)}
          />

          <div style={styles.actionRow}>
            <button
              style={{
                ...styles.mainBtn,
                opacity: isEnLoading ? 0.7 : 1,
                cursor: isEnLoading ? 'not-allowed' : 'pointer',
                transform: isEnLoading ? 'none' : 'scale(1)'
              }}
              onClick={() => translateText(enInput, 'en', 'hi', setHiOutput, setIsEnLoading, setEnError)}
              disabled={isEnLoading}
            >
              {isEnLoading ? 'Translating...' : 'Translate'}
            </button>
            <button
              style={styles.clearBtn}
              onClick={() => clearText(setEnInput, setHiOutput, setEnError)}
            >
              Clear
            </button>
          </div>

          {enError && <div style={styles.error}>{enError}</div>}

          <div style={styles.outputSection}>
            <div style={styles.outputHeader}>
              <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>TRANSLATION</span>
              {hiOutput && (
                <button style={styles.copyBtn} onClick={() => copyToClipboard(hiOutput)}>
                  📋 Copy
                </button>
              )}
            </div>
            <div style={styles.outputBox}>
              {hiOutput || <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '1rem' }}>Output will be displayed here...</span>}
            </div>
          </div>
        </section>

        {/* Section 2: Hindi -> English */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.langLabel}>🇮🇳 Hindi</span>
            <span style={{ color: '#94a3b8' }}>→</span>
            <span style={styles.langLabel}>🇬🇧 English</span>
          </div>

          <textarea
            style={styles.textarea}
            placeholder="हिंदी में यहाँ लिखें..."
            value={hiInput}
            onChange={(e) => setHiInput(e.target.value)}
          />

          <div style={styles.actionRow}>
            <button
              style={{
                ...styles.mainBtn,
                background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                opacity: isHiLoading ? 0.7 : 1,
                cursor: isHiLoading ? 'not-allowed' : 'pointer'
              }}
              onClick={() => translateText(hiInput, 'hi', 'en', setEnOutput, setIsHiLoading, setHiError)}
              disabled={isHiLoading}
            >
              {isHiLoading ? 'Translating...' : 'Translate'}
            </button>
            <button
              style={styles.clearBtn}
              onClick={() => clearText(setHiInput, setEnOutput, setHiError)}
            >
              Clear
            </button>
          </div>

          {hiError && <div style={styles.error}>{hiError}</div>}

          <div style={styles.outputSection}>
            <div style={styles.outputHeader}>
              <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>TRANSLATION</span>
              {enOutput && (
                <button style={styles.copyBtn} onClick={() => copyToClipboard(enOutput)}>
                  📋 Copy
                </button>
              )}
            </div>
            <div style={styles.outputBox}>
              {enOutput || <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '1rem' }}>अनुवाद यहाँ दिखाई देगा...</span>}
            </div>
          </div>
        </section>
      </main>

      <footer style={{ marginTop: '50px', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
        Powered by MyMemory API •  ArunTranslate Engineered For speed
      </footer>
    </div>
  );
};

export default App;
