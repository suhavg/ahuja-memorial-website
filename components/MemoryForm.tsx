'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const MAX_PHOTOS = 10;
const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function MemoryForm({ buttonLabel = 'Contribute' }: { buttonLabel?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  function chooseFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);

    setFiles((current) => {
      const valid = selected.filter((file) => {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          setStatus('Please use JPG, PNG, or WebP photos.');
          return false;
        }
        if (file.size > MAX_FILE_SIZE) {
          setStatus('Each photo must be 8 MB or smaller.');
          return false;
        }
        return true;
      });

      const combined = [...current, ...valid];
      const unique = combined.filter(
        (file, index, all) =>
          index ===
          all.findIndex(
            (other) =>
              other.name === file.name &&
              other.size === file.size &&
              other.lastModified === file.lastModified
          )
      );

      if (unique.length > MAX_PHOTOS) {
        setStatus(`You can upload up to ${MAX_PHOTOS} photos per memory.`);
        return unique.slice(0, MAX_PHOTOS);
      }

      if (valid.length > 0) setStatus('');
      return unique;
    });

    e.target.value = '';
  }

  function removeFile(index: number) {
    setFiles((current) => current.filter((_, i) => i !== index));
  }

  function resetForm() {
    setName('');
    setRelationship('');
    setMessage('');
    setFiles([]);
    setStatus('');
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('');

    if (!name.trim() || !message.trim()) {
      setStatus('Please enter your name and a message.');
      return;
    }

    setSubmitting(true);

    const form = new FormData();
    form.append('name', name);
    form.append('relationship', relationship);
    form.append('message', message);
    files.forEach((file) => form.append('photos', file));

    try {
      const res = await fetch('/api/memories', {
        method: 'POST',
        body: form,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not submit memory.');

      resetForm();
      setOpen(false);
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not submit memory.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button className="button primary contribute-button" onClick={() => setOpen(true)}>
        {buttonLabel}
      </button>

      {open && (
        <div className="modal-backdrop" onMouseDown={() => setOpen(false)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h3>Contribute</h3>
                <div className="note">Share one photo or a whole collection — photos are optional.</div>
              </div>
              <button className="close" type="button" onClick={() => setOpen(false)} aria-label="Close">
                ×
              </button>
            </div>

            <form className="form-grid" onSubmit={submit}>
              <label>
                Your name
                <input value={name} onChange={(e) => setName(e.target.value)} required />
              </label>

              <label>
                Relationship (optional)
                <input value={relationship} onChange={(e) => setRelationship(e.target.value)} />
              </label>

              <label>
                Memory or message
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} required />
              </label>

              <label>
                Photos (optional — select multiple)
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={chooseFiles}
                />
              </label>

              {previews.length > 0 && (
                <div className="upload-preview-grid">
                  {previews.map((src, index) => (
                    <div className="upload-preview" key={src}>
                      <img src={src} alt={`Selected photo ${index + 1}`} />
                      <button type="button" onClick={() => removeFile(index)} aria-label="Remove photo">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="note">Up to 10 photos, 8 MB each. JPG, PNG, or WebP.</div>
              {status && <div className="form-status">{status}</div>}

              <button className="button primary" type="submit" disabled={submitting}>
                {submitting ? 'Posting…' : 'Post memory'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
