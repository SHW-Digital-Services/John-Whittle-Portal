import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MediaUploadModal } from '../../src/components/MediaUploadModal';
import { PictureGallery } from '../../src/components/PictureGallery';
import { AudioPlayerBar } from '../../src/components/AudioPlayerBar';
import { ImagePlus } from 'lucide-react';
import '../../src/index.css';
const items = [{ id: 'photo', ownerId: 'qa', title: 'A treasured memory', kind: 'picture' as const, path: 'memorial-media/qa/picture/photo', contentType: 'image/jpeg', size: 31203 }, { id: 'audio', ownerId: 'qa', title: 'Remembering John', kind: 'audio' as const, path: 'memorial-media/qa/audio/audio', contentType: 'audio/wav', size: 100 }];
function Fixture() {
 const canUpload = new URLSearchParams(location.search).get('manager') !== 'false';
 const [open, setOpen] = useState(false);
 return <><PictureGallery items={items} pendingItems={[]} loading={false} error="" isDarkMode={true} canManage={canUpload} onUpload={() => setOpen(true)} onApprove={async () => {}} onReject={async () => {}} />
 {canUpload && <button className="fixed bottom-4 left-4 h-12 w-12 rounded-full bg-neutral-900" aria-label="Submit a photo or video" onClick={() => setOpen(true)}><ImagePlus /></button>}
 <AudioPlayerBar isDarkMode={true} tracks={items.filter(item => item.kind === 'audio')} isLoggedIn={true} canUpload={canUpload} mediaErrorMessage="" onOpenUploads={() => setOpen(true)} />
 {canUpload && open && <MediaUploadModal isDarkMode={true} onClose={() => setOpen(false)} onGallery={() => setOpen(false)} />}</>;
}
createRoot(document.getElementById('root')!).render(<Fixture />);
