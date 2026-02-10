import React, { useState } from 'react';
import LiveRecordingControl from '../components/LiveRecordingControl';

const LiveControlScreen = () => {
  const [streamUrl, setStreamUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Contrôle du Flux Live
          </h1>
          <p className="text-gray-600">
            Enregistrez le flux en direct et téléchargez les vidéos localement
          </p>
        </div>

        {/* Configuration de l'URL du flux */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Configuration du flux</h2>
          <div className="flex gap-4">
            <input
              type="url"
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
              placeholder="URL du flux live (HLS, DASH, MP4)..."
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            URL actuelle: {streamUrl}
          </p>
        </div>

        {/* Contrôle d'enregistrement */}
        <LiveRecordingControl streamUrl={streamUrl} />

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">Guide d'utilisation</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
            <li>Configurez l'URL du flux live ci-dessus (HLS .m3u8, DASH .mpd, ou MP4 pour test)</li>
            <li>Créez le dossier <code className="bg-blue-100 px-1">C:\BF1_Recordings</code> sur votre ordinateur</li>
            <li>Configurez votre navigateur pour télécharger dans ce dossier (voir instructions dans la section d'enregistrement)</li>
            <li>Cliquez sur "Démarrer l'enregistrement" pour commencer la capture</li>
            <li>Le timer affichera la durée en temps réel</li>
            <li>Cliquez sur "Arrêter l'enregistrement" pour terminer</li>
            <li>La vidéo sera automatiquement téléchargée dans votre dossier avec un nom unique</li>
            <li>Les vidéos seront organisées par année et mois automatiquement</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default LiveControlScreen;
