import React, { useState, useEffect, useRef } from 'react';

const LiveRecordingControl = ({ streamUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }) => {
  const [activeRecording, setActiveRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Refs pour MediaRecorder
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const [recordedVideoBlob, setRecordedVideoBlob] = useState(null);
  const [startTimestamp, setStartTimestamp] = useState(null);
  const recordingDataRef = useRef(null);

  // Timer pour afficher le temps écoulé
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStartRecording = () => {
    setLoading(true);
    setError(null);
    recordedChunksRef.current = [];
    
    try {
      // Sauvegarder le timestamp de début de la vidéo
      if (videoRef.current) {
        setStartTimestamp(videoRef.current.currentTime);
        console.log(`Timestamp de début: ${videoRef.current.currentTime.toFixed(2)}s`);
      }
      
      // Créer un enregistrement local simple
      const recordingData = {
        id: Date.now().toString(),
        start_time: new Date(),
        title: `Enregistrement ${new Date().toLocaleString()}`,
        duration_seconds: 0
      };
      
      setActiveRecording(recordingData);
      setIsRecording(true);
      setElapsedTime(0);
      
      // Démarrer la capture vidéo avec MediaRecorder
      if (videoRef.current && videoRef.current.captureStream) {
        const stream = videoRef.current.captureStream();
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp9',
          videoBitsPerSecond: 2500000 // 2.5 Mbps
        });
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };
        
        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          setRecordedVideoBlob(blob);
          console.log(`Vidéo enregistrée: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
          
          // Télécharger automatiquement dès que le blob est prêt
          if (recordingDataRef.current) {
            downloadRecordedVideo(recordingDataRef.current, blob);
            recordingDataRef.current = null;
          }
        };
        
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start(1000); // Capturer par chunks de 1 seconde
        console.log('Capture vidéo démarrée');
      } else {
        setError('captureStream non supporté par votre navigateur');
      }
    } catch (err) {
      setError('Erreur lors du démarrage de l\'enregistrement');
      console.error('Erreur démarrage:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStopRecording = () => {
    if (!activeRecording) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Sauvegarder les données d'enregistrement pour le callback onstop
      recordingDataRef.current = {
        ...activeRecording,
        duration_seconds: elapsedTime
      };
      
      // Arrêter la capture vidéo (le téléchargement se fera dans onstop)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        console.log('Capture vidéo arrêtée');
      }
      
      setIsRecording(false);
      setActiveRecording(null);
      
    } catch (err) {
      setError('Erreur lors de l\'arrêt de l\'enregistrement');
      console.error('Erreur arrêt:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadRecordedVideo = (recordingData, blob) => {
    if (!blob) {
      console.error('Aucune vidéo enregistrée à télécharger');
      return;
    }

    // Générer un nom de fichier unique et descriptif avec structure de dossier
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`; // 2026-02-10
    const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-'); // 18-30-45
    const durationStr = recordingData.duration_seconds 
      ? `${Math.floor(recordingData.duration_seconds / 60)}min${recordingData.duration_seconds % 60}s`
      : '0s';
    
    // Structure: BF1_Recordings/2026/02-Février/Recording_2026-02-10_18-30-45_2min30s.webm
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const monthName = monthNames[date.getMonth()];
    
    const filename = `BF1_Recordings/${year}/${month}-${monthName}/Recording_${dateStr}_${timeStr}_${durationStr}.webm`;
    
    // Créer un lien de téléchargement
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Nettoyer
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    console.log(`Vidéo téléchargée: ${filename}`);
    
    // Afficher un message de succès avec instructions
    const successMsg = `Vidéo enregistrée avec succès\n\n` +
                       `Fichier: ${filename}\n` +
                       `Taille: ${(blob.size / 1024 / 1024).toFixed(2)} MB\n\n` +
                       `Conseil: Configurez votre navigateur pour télécharger automatiquement dans C:\\BF1_Recordings\\`;
    
    setSuccessMessage(successMsg);
    
    // Réinitialiser
    setRecordedVideoBlob(null);
    recordedChunksRef.current = [];
    setStartTimestamp(null);
    
    // Masquer le message après 8 secondes
    setTimeout(() => setSuccessMessage(null), 8000);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">
        Contrôle d'enregistrement du flux live
      </h2>

      {/* Prévisualisation du flux */}
      <div className="mb-6">
        <div className="relative bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
          <video
            ref={videoRef}
            src={streamUrl}
            className="absolute top-0 left-0 w-full h-full"
            controls
            autoPlay
            muted
            crossOrigin="anonymous"
          />
          {isRecording && (
            <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full flex items-center animate-pulse">
              <span className="w-3 h-3 bg-white rounded-full mr-2"></span>
              REC {formatTime(elapsedTime)}
            </div>
          )}
        </div>
      </div>

      {/* Instructions de configuration */}
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Configuration du dossier d'enregistrement</h3>
        <p className="text-sm text-blue-800 mb-2">
          Les vidéos enregistrées seront automatiquement organisées dans un dossier dédié avec une structure par année et mois.
        </p>
        <p className="text-sm text-blue-800 mb-2">
          <strong>Structure des fichiers :</strong>
        </p>
        <code className="text-xs bg-blue-100 px-2 py-1 rounded block mb-3">
          BF1_Recordings/2026/02-Février/Recording_2026-02-10_18-30-45_2min30s.webm
        </code>
        <details className="text-sm text-blue-800">
          <summary className="cursor-pointer font-semibold mb-1">Instructions de configuration du navigateur</summary>
          <div className="mt-2 space-y-2">
            <p className="text-xs font-semibold">Étape 1 : Créer le dossier principal</p>
            <ul className="list-disc list-inside ml-2 space-y-1 text-xs">
              <li>Créez le dossier <code className="bg-blue-100 px-1">C:\BF1_Recordings</code> sur votre ordinateur</li>
              <li>Les sous-dossiers (année/mois) seront créés automatiquement</li>
            </ul>
            <p className="text-xs font-semibold mt-2">Étape 2 : Configurer le navigateur</p>
            <ul className="list-disc list-inside ml-2 space-y-1 text-xs">
              <li><strong>Chrome/Edge :</strong> Paramètres → Téléchargements → Emplacement → Sélectionner le dossier</li>
              <li><strong>Firefox :</strong> Paramètres → Général → Téléchargements → Enregistrer les fichiers dans</li>
            </ul>
          </div>
        </details>
      </div>

      {/* Note technique */}
      <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-xs text-gray-600">
          <strong>Note technique :</strong> Le système capture en temps réel ce qui est diffusé pendant l'enregistrement. 
          Pour un flux live (HLS/DASH), seul le contenu diffusé sera enregistré. 
          Pour les tests avec fichier MP4, laissez la vidéo jouer normalement sans interruption.
        </p>
      </div>

      {/* Informations sur l'enregistrement */}
      {activeRecording && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Enregistrement en cours</h3>
          <p className="text-sm text-gray-600">Titre: {activeRecording.title}</p>
          <p className="text-sm text-gray-600">Démarré: {new Date(activeRecording.start_time).toLocaleString()}</p>
          <p className="text-sm text-gray-600">Durée: {formatTime(elapsedTime)}</p>
          {startTimestamp !== null && videoRef.current && (
            <p className="text-sm text-gray-600">
              Segment: {startTimestamp.toFixed(1)}s → {videoRef.current.currentTime.toFixed(1)}s
            </p>
          )}
          <p className="text-sm text-gray-600">Statut: <span className="font-semibold">{activeRecording.status}</span></p>
        </div>
      )}

      {/* Messages d'erreur */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Boutons de contrôle */}
      <div className="flex gap-4">
        {!isRecording ? (
          <button
            onClick={handleStartRecording}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <span className="mr-2">⏺</span>
            {loading ? 'Démarrage...' : 'Démarrer l\'enregistrement'}
          </button>
        ) : (
          <button
            onClick={handleStopRecording}
            disabled={loading}
            className="flex-1 bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <span className="mr-2">⏹</span>
            {loading ? 'Arrêt...' : 'Arrêter l\'enregistrement'}
          </button>
        )}
      </div>

      {/* Message de succès */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 whitespace-pre-line">{successMessage}</p>
        </div>
      )}
    </div>
  );
};

export default LiveRecordingControl;
