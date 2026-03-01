import React, { useState, useRef } from 'react';

// ─── RESUME FILE UPLOADER ─────────────────────────────────────────────────────
// Supports PDF (via pdfjs-dist) and DOCX (via mammoth-like text extraction)
// Falls back to manual text paste if file parsing fails.

export default function ResumeUploader({ onTextExtracted }) {
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [fileName, setFileName] = useState('');
  const [preview, setPreview] = useState('');
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setFileName(file.name);
    setStatus('loading');

    const ext = file.name.split('.').pop().toLowerCase();

    try {
      let text = '';

      if (ext === 'pdf') {
        text = await extractFromPDF(file);
      } else if (ext === 'docx' || ext === 'doc') {
        text = await extractFromDOCX(file);
      } else if (ext === 'txt') {
        text = await file.text();
      } else {
        throw new Error('Unsupported format. Use PDF, DOCX, or TXT.');
      }

      if (!text || text.trim().length < 30) {
        throw new Error('Could not extract text. Try pasting manually.');
      }

      setPreview(text.slice(0, 200) + '...');
      setStatus('success');
      onTextExtracted(text);
    } catch (err) {
      setStatus('error');
      setPreview(err.message);
    }
  };

  async function extractFromPDF(file) {
    try {
      // Dynamically import pdfjs-dist
      const pdfjsLib = await import('pdfjs-dist/build/pdf');
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map(item => item.str).join(' ') + '\n';
      }
      return fullText;
    } catch (err) {
      // Fallback: read as text (for text-based PDFs)
      const text = await file.text();
      if (text.length > 100) return text;
      throw new Error('PDF parsing requires pdfjs-dist. Run: npm install pdfjs-dist');
    }
  }

  async function extractFromDOCX(file) {
    try {
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch {
      // Fallback: try reading as text
      try {
        const text = await file.text();
        // Strip XML tags from DOCX
        return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      } catch {
        throw new Error('DOCX parsing requires mammoth. Run: npm install mammoth');
      }
    }
  }

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const statusColors = { idle: 'var(--border)', loading: 'var(--amber)', success: 'var(--emerald)', error: 'var(--rose)' };
  const statusIcons = { idle: '📄', loading: '⏳', success: '✅', error: '❌' };

  return (
    <div>
      <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>
        Upload Resume (PDF / DOCX / TXT)
      </label>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        style={{
          border: `2px dashed ${statusColors[status]}`, borderRadius: 12, padding: '24px 20px',
          textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
          background: status === 'success' ? 'rgba(16,255,170,0.04)' : status === 'error' ? 'rgba(255,75,125,0.04)' : 'var(--bg-surface)',
        }}
        onMouseOver={e => { if (status === 'idle') e.currentTarget.style.borderColor = 'var(--cyan)'; }}
        onMouseOut={e => { if (status === 'idle') e.currentTarget.style.borderColor = 'var(--border)'; }}
      >
        <div style={{ fontSize: 32, marginBottom: 8 }}>{statusIcons[status]}</div>
        {status === 'idle' && (
          <>
            <div style={{ color: 'var(--text-primary)', fontSize: 14, marginBottom: 4 }}>Drop your resume here or click to browse</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Supports PDF, DOCX, TXT</div>
          </>
        )}
        {status === 'loading' && <div style={{ color: 'var(--amber)', fontSize: 14 }}>Extracting text from {fileName}...</div>}
        {status === 'success' && (
          <>
            <div style={{ color: 'var(--emerald)', fontSize: 14, marginBottom: 6 }}>✅ Extracted from {fileName}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-mono)', lineHeight: 1.6 }}>{preview}</div>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ color: 'var(--rose)', fontSize: 14, marginBottom: 6 }}>Failed to parse file</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{preview}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 6 }}>Please paste your resume text below instead</div>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt"
        style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files[0])}
      />

      {status === 'success' && (
        <button
          onClick={() => { setStatus('idle'); setFileName(''); setPreview(''); onTextExtracted(''); }}
          style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Clear & re-upload
        </button>
      )}
    </div>
  );
}
