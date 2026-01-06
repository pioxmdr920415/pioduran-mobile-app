import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SupportResourcesLayout = () => {
  const [images, setImages] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [assorted, setAssorted] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
  const folderId = process.env.REACT_APP_GOOGLE_DRIVE_FOLDER_ID;

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get(`https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${apiKey}&fields=files(id,name,mimeType,webContentLink,thumbnailLink)`);
        const files = response.data.files;
        setImages(files.filter(f => f.mimeType.startsWith('image/')));
        setPdfs(files.filter(f => f.mimeType === 'application/pdf'));
        setAssorted(files.filter(f => !f.mimeType.startsWith('image/') && f.mimeType !== 'application/pdf'));
      } catch (error) {
        console.error('Error fetching files:', error);
      } finally {
        setLoading(false);
      }
    };
    if (apiKey && folderId) {
      fetchFiles();
    } else {
      setLoading(false);
    }
  }, [apiKey, folderId]);

  const nationalAgencies = [
    { name: 'DSWD Disaster Response', url: 'https://www.dswd.gov.ph/disaster-response/' },
    { name: 'Philippine Red Cross', url: 'https://redcross.org.ph/' },
    { name: 'NDRRMC Resources', url: 'https://ndrrmc.gov.ph/' },
  ];

  if (loading) return <div className="text-white">Loading resources...</div>;

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-bold text-white mb-4">Flyers & Brochures</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map(file => (
            <div key={file.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <img src={file.thumbnailLink} alt={file.name} className="w-full h-32 object-cover rounded mb-2" />
              <a href={`https://drive.google.com/uc?export=download&id=${file.id}`} className="text-yellow-500 block" download>{file.name}</a>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-xl font-bold text-white mb-4">PDF Documents</h2>
        <div className="space-y-2">
          {pdfs.map(file => (
            <div key={file.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <a href={`https://drive.google.com/uc?export=download&id=${file.id}`} className="text-yellow-500" download>{file.name}</a>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-xl font-bold text-white mb-4">Assorted Files</h2>
        <div className="space-y-2">
          {assorted.map(file => (
            <div key={file.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <a href={`https://drive.google.com/uc?export=download&id=${file.id}`} className="text-yellow-500" download>{file.name}</a>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-xl font-bold text-white mb-4">National Agency Resources</h2>
        <div className="space-y-2">
          {nationalAgencies.map((agency, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <a href={agency.url} className="text-yellow-500" target="_blank" rel="noopener noreferrer">{agency.name}</a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default SupportResourcesLayout;