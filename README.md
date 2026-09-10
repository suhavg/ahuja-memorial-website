# Deepak & Madhu Ahuja Memorial Site

A self-contained Next.js memorial site with:

- A full-screen opening portrait of Deepak and Madhu
- Scroll transition into the memorial content
- Sticky two-tab navigation: Memorial Wall / Photo Gallery
- Memorial submissions with optional photos
- Multiple-photo uploads
- Submitted photos automatically appear in the gallery
- Masonry-style memory wall
- Click-to-expand photo gallery
- SQLite database storage
- Private admin page for deleting submissions

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Admin deletion page

Copy `.env.local.example` to `.env.local` and set your password, then restart the server.

Open http://localhost:3000/admin

## Important deployment note

This project stores submissions in `data/memorial.db` and images in `public/uploads`. Deploy it on a host with a persistent writable disk. A standard ephemeral/serverless filesystem will not permanently retain local uploads.
