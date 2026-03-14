'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload, Download, RotateCcw, Sun, Loader2, ImageIcon, X,
  FolderOpen, Plus, Trash2, Circle, Flashlight, Minus,
  ChevronDown, Eye, EyeOff, Sparkles,
} from 'lucide-react';
import { useAuth } from '../auth-provider';

// --- Light model ---
type LightShape = 'radial' | 'spot' | 'line';

interface Light {
  id: string;
  shape: LightShape;
  x: number;
  y: number;
  z: number;
  dz: number;
  tx: number;
  ty: number;
  color: string;
  intensity: number;
  radius: number;
  enabled: boolean;
  coneAngle: number;
  softness: number;
}

function createDefaultLights(): Light[] {
  return [
    {
      id: 'light-1', shape: 'radial',
      x: 0.3, y: 0.25, z: 0.6, dz: 0.5,
      tx: 0.5, ty: 0.5, color: '#fff5e0',
      intensity: 1.2, radius: 0.5, enabled: true,
      coneAngle: 30, softness: 0.5,
    },
    {
      id: 'light-2', shape: 'radial',
      x: 0.7, y: 0.75, z: 0.4, dz: 0.5,
      tx: 0.5, ty: 0.5, color: '#e0e8ff',
      intensity: 0.8, radius: 0.6, enabled: true,
      coneAngle: 30, softness: 0.5,
    },
  ];
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

let lightIdCounter = 3;

type ViewMode = 'matcap' | 'depth' | 'original';

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16) / 255,
    parseInt(h.substring(2, 4), 16) / 255,
    parseInt(h.substring(4, 6), 16) / 255,
  ];
}

// Simple button component to avoid external dependency
function Btn({ children, variant = 'default', size = 'default', className = '', ...props }: {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm';
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base = 'inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:opacity-50';
  const sizes = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm';
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/80',
    outline: 'border border-border bg-transparent text-foreground hover:bg-muted',
    ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
  };
  return (
    <button className={`${base} ${sizes} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

interface GalleryPhoto {
  id: string;
  collectionId: string;
  image: string;
}

interface ProjectRecord {
  id: string;
  name: string;
  photos: GalleryPhoto[];
}

export function LightingRefTool() {
  const { pb, user } = useAuth();

  // --- State ---
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Depth analysis results
  const [normalData, setNormalData] = useState<ImageData | null>(null);
  const [depthData, setDepthData] = useState<ImageData | null>(null);
  const [depthMapUrl, setDepthMapUrl] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [analysisWidth, setAnalysisWidth] = useState(0);
  const [analysisHeight, setAnalysisHeight] = useState(0);

  // Multi-light controls
  const [lights, setLights] = useState<Light[]>(createDefaultLights);
  const [selectedLightId, setSelectedLightId] = useState<string | null>('light-1');
  const [ambientIntensity, setAmbientIntensity] = useState(15);
  const [opacity, setOpacity] = useState(60);
  const [depthInfluence, setDepthInfluence] = useState(0);
  const [showHandles, setShowHandles] = useState(true);
  const [showHighlightMap, setShowHighlightMap] = useState(false);
  const [highlightThreshold, setHighlightThreshold] = useState(70);
  const [viewMode, setViewMode] = useState<ViewMode>('matcap');

  // Gallery picker state
  const [showGalleryPicker, setShowGalleryPicker] = useState(false);
  const [galleryProjects, setGalleryProjects] = useState<ProjectRecord[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);

  // Light dragging state
  const [draggingLightId, setDraggingLightId] = useState<string | null>(null);
  const [draggingHandle, setDraggingHandle] = useState<'position' | 'target'>('position');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- Dropzone ---
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(reader.result as string);
      setImageFile(file);
      resetAnalysis();
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxFiles: 1,
  });

  function resetAnalysis() {
    setNormalData(null);
    setDepthData(null);
    setDepthMapUrl(null);
    setOriginalImage(null);
    setLights(createDefaultLights());
    setSelectedLightId('light-1');
    setAmbientIntensity(15);
    setViewMode('matcap');
  }

  // --- Load map pixels into ImageData ---
  const loadMapData = useCallback(async (url: string, w: number, h: number) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    return new Promise<ImageData>((resolve, reject) => {
      img.onload = () => {
        const offscreen = document.createElement('canvas');
        offscreen.width = w;
        offscreen.height = h;
        const ctx = offscreen.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
        resolve(ctx.getImageData(0, 0, w, h));
      };
      img.onerror = () => reject(new Error('Failed to load map'));
      img.src = url;
    });
  }, []);

  const loadOriginalImage = useCallback(async (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load original image'));
      img.src = url;
    });
  }, []);

  // --- Run depth estimation ---
  const runDepthEstimation = useCallback(async (srcUrl: string, displayUrl: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/ai/depth-estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: srcUrl, pbToken: pb.authStore.token }),
      });

      const data = await res.json();
      if (!data.success || !data.data) {
        throw new Error(data.error || 'Depth estimation failed');
      }

      const { depthMapUrl: dUrl, normalMapUrl: nUrl, width, height } = data.data;
      setDepthMapUrl(dUrl);
      setAnalysisWidth(width);
      setAnalysisHeight(height);

      const [nData, dData, origImg] = await Promise.all([
        loadMapData(nUrl, width, height),
        loadMapData(dUrl, width, height),
        loadOriginalImage(displayUrl),
      ]);

      setNormalData(nData);
      setDepthData(dData);
      setOriginalImage(origImg);
    } catch (error: unknown) {
      console.error('[LightingRef] Depth estimation failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [pb, loadMapData, loadOriginalImage]);

  // --- Handle URL-based source (gallery pick) ---
  const handleSourceUrl = useCallback(async (url: string) => {
    setImageDataUrl(url);
    resetAnalysis();
    setImageDataUrl(url);
    await runDepthEstimation(url, url);
  }, [runDepthEstimation]);

  // --- Upload file and analyze ---
  const handleAnalyze = async () => {
    if (!imageFile || !imageDataUrl) return;

    // For PocketBase, upload the file to a temp record or use the data URL directly
    // Since our API route accepts any URL, we can upload to PB first
    setIsProcessing(true);
    try {
      // Create a temporary record in PocketBase to host the image
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('user', user!.id);

      let srcUrl: string;
      try {
        // Try to use a temp_uploads collection if it exists
        const record = await pb.collection('temp_uploads').create(formData);
        srcUrl = pb.files.getURL(record, record.image);
      } catch {
        // Fallback: use the data URL directly (API route will handle it)
        srcUrl = imageDataUrl;
      }

      await runDepthEstimation(srcUrl, imageDataUrl);
    } catch (error: unknown) {
      console.error('[LightingRef] Analysis failed:', error);
      setIsProcessing(false);
    }
  };

  // --- Render multi-light shading onto canvas ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !normalData || !originalImage || analysisWidth === 0) return;

    canvas.width = analysisWidth;
    canvas.height = analysisHeight;
    const ctx = canvas.getContext('2d')!;

    if (viewMode === 'original') {
      ctx.drawImage(originalImage, 0, 0, analysisWidth, analysisHeight);
      return;
    }

    if (viewMode === 'depth' && depthMapUrl) {
      const depthImg = new Image();
      depthImg.crossOrigin = 'anonymous';
      depthImg.onload = () => ctx.drawImage(depthImg, 0, 0, analysisWidth, analysisHeight);
      depthImg.src = depthMapUrl;
      return;
    }

    // Multi-light shading
    const pixels = normalData.data;
    const depthPixels = depthData?.data ?? null;
    const w = analysisWidth;
    const h = analysisHeight;

    ctx.drawImage(originalImage, 0, 0, w, h);
    const origPixels = ctx.getImageData(0, 0, w, h);
    const origData = origPixels.data;

    const output = ctx.createImageData(w, h);
    const out = output.data;
    const alpha = opacity / 100;
    const ambient = ambientIntensity / 100;
    const depthAlpha = depthInfluence / 100;

    const highlightMapOn = showHighlightMap;
    const highThresh = (highlightThreshold / 100) * 1.5;
    const midThresh = highThresh * 0.6;

    const enabledLights = lights.filter(l => l.enabled);
    const dim = Math.max(w, h);
    const lightProps = enabledLights.map(l => {
      const scale = l.shape === 'radial' ? 0.25 : 1.0;
      const radiusPx = l.radius * dim * scale;
      const invTwoSigmaSq = 1 / (2 * radiusPx * radiusPx);
      const coneCos = Math.cos((l.coneAngle * Math.PI) / 180);
      const ltx = l.tx * w;
      const lty = l.ty * h;
      const lx = l.x * w;
      const ly = l.y * h;
      const segDx = ltx - lx;
      const segDy = lty - ly;
      const segLenSq = segDx * segDx + segDy * segDy;
      const normalStrength = l.shape === 'spot' ? 0.7 : 0.3;

      return {
        shape: l.shape, lx, ly, lz: l.z * dim, ldz: l.dz,
        ltx, lty, rgb: hexToRgb(l.color), intensity: l.intensity,
        invTwoSigmaSq, coneCos, softness: l.softness,
        segDx, segDy, segLenSq, normalStrength,
      };
    });

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        const pi = i * 4;

        const nx = (pixels[pi] / 255) * 2 - 1;
        const ny = (pixels[pi + 1] / 255) * 2 - 1;
        const nz = (pixels[pi + 2] / 255) * 2 - 1;

        let lr = ambient, lg = ambient, lb = ambient;

        for (let li = 0; li < lightProps.length; li++) {
          const light = lightProps[li];
          const dx = light.lx - x;
          const dy = light.ly - y;
          const dist2d = dx * dx + dy * dy;

          let falloff: number;
          let rimNormalOverride = -1;

          if (light.shape === 'spot') {
            const toPxDx = x - light.lx;
            const toPxDy = y - light.ly;
            const toPxLen = Math.sqrt(toPxDx * toPxDx + toPxDy * toPxDy);
            if (toPxLen < 0.001) {
              falloff = 1.0;
            } else {
              const aimDx = light.ltx - light.lx;
              const aimDy = light.lty - light.ly;
              const aimLen = Math.sqrt(aimDx * aimDx + aimDy * aimDy);
              if (aimLen < 0.001) {
                falloff = Math.exp(-dist2d * light.invTwoSigmaSq);
              } else {
                const cosAngle = (toPxDx * aimDx + toPxDy * aimDy) / (toPxLen * aimLen);
                const coneFalloff = smoothstep(
                  light.coneCos - light.softness * 0.3,
                  light.coneCos,
                  cosAngle
                );
                falloff = coneFalloff * Math.exp(-dist2d * light.invTwoSigmaSq);
              }
            }
          } else if (light.shape === 'line') {
            if (light.segLenSq < 0.001) {
              falloff = Math.exp(-dist2d * light.invTwoSigmaSq);
            } else {
              const t = Math.max(0, Math.min(1,
                ((x - light.lx) * light.segDx + (y - light.ly) * light.segDy) / light.segLenSq
              ));
              const closestX = light.lx + t * light.segDx;
              const closestY = light.ly + t * light.segDy;
              const perpDx = x - closestX;
              const perpDy = y - closestY;
              const perpDist2 = perpDx * perpDx + perpDy * perpDy;
              falloff = Math.exp(-perpDist2 * light.invTwoSigmaSq);

              const perpLen = Math.sqrt(perpDist2 + light.lz * light.lz);
              if (perpLen > 0.001) {
                const rimDot = nx * (-perpDx / perpLen) + ny * (-perpDy / perpLen) + nz * (light.lz / perpLen);
                rimNormalOverride = 0.15 + 0.85 * Math.max(0, rimDot);
              }
            }
          } else {
            falloff = Math.exp(-dist2d * light.invTwoSigmaSq);
          }

          const heightZ = light.lz;
          let depthZ = 0;
          if (depthAlpha > 0 && depthPixels) {
            const surfaceDepth = depthPixels[pi] / 255;
            const depthDiff = light.ldz - surfaceDepth;
            depthZ = depthDiff * dim * depthAlpha * 0.6;
          }
          const totalZ = heightZ + depthZ;

          let normalMod = 1.0;
          if (rimNormalOverride >= 0) {
            normalMod = rimNormalOverride;
          } else {
            const len = Math.sqrt(dist2d + totalZ * totalZ);
            if (len > 0) {
              const dot = nx * (dx / len) + ny * (dy / len) + nz * (totalZ / len);
              normalMod = 1.0 - light.normalStrength + light.normalStrength * Math.max(0, dot);
            }
          }

          let depthFalloff = 1.0;
          if (depthAlpha > 0 && depthPixels) {
            const surfaceDepth = depthPixels[pi] / 255;
            const depthDist = Math.abs(light.ldz - surfaceDepth);
            depthFalloff = 1.0 - depthAlpha + depthAlpha * Math.exp(-depthDist * depthDist * 8);
          }

          const contribution = falloff * normalMod * depthFalloff * light.intensity;
          lr += contribution * light.rgb[0];
          lg += contribution * light.rgb[1];
          lb += contribution * light.rgb[2];
        }

        const litR = Math.min(255, Math.round(origData[pi] * lr));
        const litG = Math.min(255, Math.round(origData[pi + 1] * lg));
        const litB = Math.min(255, Math.round(origData[pi + 2] * lb));

        let finalR = Math.round(origData[pi] * (1 - alpha) + litR * alpha);
        let finalG = Math.round(origData[pi + 1] * (1 - alpha) + litG * alpha);
        let finalB = Math.round(origData[pi + 2] * (1 - alpha) + litB * alpha);

        if (highlightMapOn) {
          const totalLight = (lr + lg + lb - ambient * 3) / 3;
          if (totalLight > highThresh) {
            finalR = Math.round(finalR * 0.3);
            finalG = Math.round(finalG * 0.3 + 255 * 0.7);
            finalB = Math.round(finalB * 0.3 + 255 * 0.7);
          } else if (totalLight > midThresh) {
            const t2 = 0.4;
            finalR = Math.round(finalR * (1 - t2) + 255 * t2);
            finalG = Math.round(finalG * (1 - t2) + 230 * t2);
            finalB = Math.round(finalB * (1 - t2) + 80 * t2);
          }
        }

        out[pi] = finalR;
        out[pi + 1] = finalG;
        out[pi + 2] = finalB;
        out[pi + 3] = 255;
      }
    }

    ctx.putImageData(output, 0, 0);
  }, [normalData, depthData, originalImage, lights, opacity, ambientIntensity, depthInfluence, showHighlightMap, highlightThreshold, viewMode, analysisWidth, analysisHeight, depthMapUrl]);

  // --- Light dragging ---
  const getHandleAtPos = useCallback((clientX: number, clientY: number): { id: string; handle: 'position' | 'target' } | null => {
    const container = canvasContainerRef.current;
    if (!container) return null;
    const rect = container.getBoundingClientRect();
    const nx = (clientX - rect.left) / rect.width;
    const ny = (clientY - rect.top) / rect.height;
    const hitRadius = 24 / rect.width;
    const hitRadiusSq = hitRadius * hitRadius;

    for (let i = lights.length - 1; i >= 0; i--) {
      const l = lights[i];
      if (l.shape === 'radial') continue;
      const dx = nx - l.tx;
      const dy = ny - l.ty;
      if (dx * dx + dy * dy < hitRadiusSq) return { id: l.id, handle: 'target' };
    }
    for (let i = lights.length - 1; i >= 0; i--) {
      const l = lights[i];
      const dx = nx - l.x;
      const dy = ny - l.y;
      if (dx * dx + dy * dy < hitRadiusSq) return { id: l.id, handle: 'position' };
    }
    return null;
  }, [lights]);

  const updateHandlePosition = useCallback((lightId: string, handle: 'position' | 'target', clientX: number, clientY: number) => {
    const container = canvasContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const nx = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const ny = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    setLights(prev => prev.map(l => {
      if (l.id !== lightId) return l;
      if (handle === 'target') return { ...l, tx: nx, ty: ny };
      return { ...l, x: nx, y: ny };
    }));
  }, []);

  const handleCanvasPointerDown = useCallback((e: React.PointerEvent) => {
    const hit = getHandleAtPos(e.clientX, e.clientY);
    setShowAddMenu(false);
    if (hit) {
      setSelectedLightId(hit.id);
      setDraggingLightId(hit.id);
      setDraggingHandle(hit.handle);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      e.preventDefault();
    } else {
      setSelectedLightId(null);
    }
  }, [getHandleAtPos]);

  const handleCanvasPointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingLightId) return;
    e.preventDefault();
    updateHandlePosition(draggingLightId, draggingHandle, e.clientX, e.clientY);
  }, [draggingLightId, draggingHandle, updateHandlePosition]);

  const handleCanvasPointerUp = useCallback(() => {
    setDraggingLightId(null);
  }, []);

  // --- Light management ---
  const addLight = (shape: LightShape = 'radial') => {
    if (lights.length >= 5) return;
    const id = `light-${lightIdCounter++}`;
    const defaults = { id, enabled: true, coneAngle: 30, softness: 0.5, dz: 0.5 };
    const newLight: Light = shape === 'spot'
      ? { ...defaults, shape: 'spot', x: 0.3, y: 0.3, z: 0.5, tx: 0.5, ty: 0.5, color: '#ffffff', intensity: 1.0, radius: 0.5 }
      : shape === 'line'
      ? { ...defaults, shape: 'line', x: 0.3, y: 0.5, z: 0.5, tx: 0.7, ty: 0.5, color: '#ffffff', intensity: 1.0, radius: 0.5 }
      : { ...defaults, shape: 'radial', x: 0.5, y: 0.5, z: 0.5, tx: 0.5, ty: 0.5, color: '#ffffff', intensity: 1.0, radius: 0.5 };
    setLights(prev => [...prev, newLight]);
    setSelectedLightId(id);
    setShowAddMenu(false);
  };

  const removeLight = (id: string) => {
    setLights(prev => prev.filter(l => l.id !== id));
    if (selectedLightId === id) {
      setSelectedLightId(lights.find(l => l.id !== id)?.id ?? null);
    }
  };

  const updateLight = (id: string, updates: Partial<Light>) => {
    setLights(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const selectedLight = lights.find(l => l.id === selectedLightId) ?? null;

  // --- Download ---
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement('a');
      link.download = 'lighting-ref.png';
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    }, 'image/png');
  };

  const handleReset = () => {
    setImageFile(null);
    setImageDataUrl(null);
    resetAnalysis();
  };

  // --- Gallery picker (PocketBase) ---
  const handleOpenGallery = async () => {
    setShowGalleryPicker(true);
    setIsLoadingGallery(true);
    try {
      const photos = await pb.collection('photos').getFullList({
        filter: `user="${user!.id}"`,
        expand: 'project',
        sort: '-created',
      });

      const projectMap: Record<string, ProjectRecord> = {};

      photos.forEach((photo: any) => {
        const projectId = photo.project;
        if (!projectId) return;

        const projectName = photo.expand?.project?.name || 'Untitled Project';

        if (!projectMap[projectId]) {
          projectMap[projectId] = {
            id: projectId,
            name: projectName,
            photos: [],
          };
        }

        projectMap[projectId].photos.push({
          id: photo.id,
          collectionId: photo.collectionId,
          image: photo.image,
        });
      });

      setGalleryProjects(Object.values(projectMap));
    } catch (error) {
      console.error('[LightingRef] Failed to load projects:', error);
    } finally {
      setIsLoadingGallery(false);
    }
  };

  const handleSelectGalleryPhoto = (photo: GalleryPhoto) => {
    const url = pb.files.getURL({ id: photo.id, collectionId: photo.collectionId } as Record<string, unknown>, photo.image);
    setShowGalleryPicker(false);
    handleSourceUrl(url);
  };

  const hasResults = normalData !== null && originalImage !== null;
  const showUpload = !hasResults && !isProcessing;

  return (
    <div className="space-y-6">
      {/* Upload section */}
      {showUpload && (
        <div className="space-y-4">
          {!imageDataUrl ? (
            <>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
                  ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'}`}
              >
                <input {...getInputProps()} />
                <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
                <p className="text-foreground font-medium">
                  {isDragActive ? 'Drop your image here' : 'Drop a photo of your mini, or click to browse'}
                </p>
                <p className="text-sm text-muted-foreground mt-2">JPEG, PNG, or WebP — max 5MB</p>
              </div>
              <div className="flex justify-center">
                <Btn variant="outline" onClick={handleOpenGallery}>
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Choose from Gallery
                </Btn>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden border border-border bg-muted max-w-lg mx-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageDataUrl} alt="Preview" className="w-full h-auto" />
              </div>
              <div className="flex justify-center gap-3">
                <Btn variant="outline" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Choose Different Image
                </Btn>
                <Btn onClick={handleAnalyze}>
                  <Sun className="w-4 h-4 mr-2" />
                  Analyze Lighting
                </Btn>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Gallery picker modal */}
      {showGalleryPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col mx-4">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Choose from Gallery</h3>
              <Btn size="sm" variant="ghost" onClick={() => setShowGalleryPicker(false)}>
                <X className="w-4 h-4" />
              </Btn>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {isLoadingGallery ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : galleryProjects.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No projects with photos found.</p>
              ) : (
                galleryProjects.map((project) => (
                  <div key={project.id} className="border border-border rounded-lg overflow-hidden">
                    <div className="p-3">
                      <p className="font-medium text-foreground mb-2">{project.name}</p>
                      <div className="grid grid-cols-4 gap-2">
                        {project.photos.map((photo) => (
                          <button
                            key={photo.id}
                            onClick={() => handleSelectGalleryPhoto(photo)}
                            className="aspect-square rounded overflow-hidden border border-border hover:border-primary hover:ring-2 hover:ring-primary/30 transition-all"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={pb.files.getURL({ id: photo.id, collectionId: photo.collectionId } as Record<string, unknown>, photo.image, { thumb: '100x100' })}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Processing state */}
      {isProcessing && !hasResults && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-foreground font-medium">Analyzing depth...</p>
          <p className="text-sm text-muted-foreground">This may take up to 60 seconds on first run</p>
        </div>
      )}

      {/* Results — canvas + controls */}
      {hasResults && (
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Canvas with light handle overlays */}
            <div className="flex-1 min-w-0">
              <div
                ref={canvasContainerRef}
                className="relative rounded-lg overflow-hidden border border-border bg-black select-none"
                onPointerDown={handleCanvasPointerDown}
                onPointerMove={handleCanvasPointerMove}
                onPointerUp={handleCanvasPointerUp}
                style={{ touchAction: 'none' }}
              >
                <canvas ref={canvasRef} className="w-full h-auto" style={{ display: 'block' }} />

                {/* Light handle overlays */}
                {viewMode === 'matcap' && showHandles && lights.map(light => {
                  const isSelected = selectedLightId === light.id;
                  const disabledClass = !light.enabled ? 'opacity-40' : '';

                  const connectingLine = (light.shape === 'spot' || light.shape === 'line') ? (
                    <svg key={`${light.id}-line`} className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
                      <line
                        x1={`${light.x * 100}%`} y1={`${light.y * 100}%`}
                        x2={`${light.tx * 100}%`} y2={`${light.ty * 100}%`}
                        stroke={isSelected ? 'white' : 'rgba(255,255,255,0.5)'}
                        strokeWidth={isSelected ? 2 : 1}
                        strokeDasharray={light.shape === 'spot' ? '6 3' : 'none'}
                        className={disabledClass}
                      />
                    </svg>
                  ) : null;

                  const positionHandle = (
                    <div
                      className={`absolute w-6 h-6 rounded-full border-2 pointer-events-none transition-shadow ${
                        isSelected ? 'border-white ring-2 ring-white/50 shadow-lg' : 'border-white/70 shadow-md'
                      } ${disabledClass}`}
                      style={{
                        left: `${light.x * 100}%`, top: `${light.y * 100}%`,
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: light.color,
                        boxShadow: light.enabled ? `0 0 ${12 * light.intensity}px ${light.color}` : undefined,
                      }}
                    />
                  );

                  const targetHandle = (light.shape === 'spot' || light.shape === 'line') ? (
                    <div
                      className={`absolute w-4 h-4 rounded-full border-2 pointer-events-none transition-shadow ${
                        isSelected ? 'border-white ring-1 ring-white/40' : 'border-white/60'
                      } ${disabledClass}`}
                      style={{
                        left: `${light.tx * 100}%`, top: `${light.ty * 100}%`,
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: light.shape === 'line' ? light.color : 'transparent',
                        boxShadow: light.shape === 'line' && light.enabled ? `0 0 ${8 * light.intensity}px ${light.color}` : undefined,
                      }}
                    >
                      {light.shape === 'spot' && <div className="w-2 h-2 rounded-full bg-white/80 absolute inset-0 m-auto" />}
                    </div>
                  ) : null;

                  return (
                    <div key={light.id}>
                      {connectingLine}
                      {positionHandle}
                      {targetHandle}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Controls sidebar */}
            <div className="lg:w-60 space-y-4 flex-shrink-0">
              {/* Light list */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Lights</p>
                  {lights.length < 5 && (
                    <div className="relative">
                      <Btn size="sm" variant="ghost" onClick={() => setShowAddMenu(!showAddMenu)} className="h-6 px-1.5">
                        <Plus className="w-3.5 h-3.5" />
                        <ChevronDown className="w-3 h-3" />
                      </Btn>
                      {showAddMenu && (
                        <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                          <button onClick={() => addLight('radial')} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-foreground hover:bg-muted/50">
                            <Circle className="w-3.5 h-3.5" /> Radial
                          </button>
                          <button onClick={() => addLight('spot')} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-foreground hover:bg-muted/50">
                            <Flashlight className="w-3.5 h-3.5" /> Spotlight
                          </button>
                          <button onClick={() => addLight('line')} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-foreground hover:bg-muted/50">
                            <Minus className="w-3.5 h-3.5" /> Rim Light
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  {lights.map((light, idx) => (
                    <button
                      key={light.id}
                      onClick={() => setSelectedLightId(light.id)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
                        selectedLightId === light.id
                          ? 'bg-primary/10 text-foreground'
                          : 'text-muted-foreground hover:bg-muted/50'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full border border-border flex-shrink-0" style={{ backgroundColor: light.color }} />
                      <span className="flex-1 text-left">
                        {light.shape === 'spot' ? 'Spot' : light.shape === 'line' ? 'Rim' : 'Radial'} {idx + 1}
                      </span>
                      {!light.enabled && <span className="text-[10px] text-muted-foreground">OFF</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected light controls */}
              {selectedLight && (
                <div className="space-y-3 border-t border-border pt-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {selectedLight.shape === 'spot' ? 'Spot' : selectedLight.shape === 'line' ? 'Rim' : 'Radial'} {lights.findIndex(l => l.id === selectedLight.id) + 1}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateLight(selectedLight.id, { enabled: !selectedLight.enabled })}
                        className={`text-xs px-1.5 py-0.5 rounded ${
                          selectedLight.enabled ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {selectedLight.enabled ? 'ON' : 'OFF'}
                      </button>
                      {lights.length > 1 && (
                        <Btn size="sm" variant="ghost" onClick={() => removeLight(selectedLight.id)} className="h-6 w-6 p-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Btn>
                      )}
                    </div>
                  </div>

                  {/* Shape selector */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Shape</p>
                    <div className="flex gap-1">
                      {([
                        { shape: 'radial' as LightShape, icon: Circle, label: 'Radial' },
                        { shape: 'spot' as LightShape, icon: Flashlight, label: 'Spot' },
                        { shape: 'line' as LightShape, icon: Minus, label: 'Rim' },
                      ]).map(({ shape, icon: Icon, label }) => (
                        <button
                          key={shape}
                          onClick={() => {
                            const updates: Partial<Light> = { shape };
                            if (shape === 'spot' && selectedLight.shape !== 'spot') {
                              updates.tx = Math.min(1, selectedLight.x + 0.2);
                              updates.ty = Math.min(1, selectedLight.y + 0.2);
                            } else if (shape === 'line' && selectedLight.shape !== 'line') {
                              updates.tx = Math.min(1, selectedLight.x + 0.4);
                              updates.ty = selectedLight.y;
                            }
                            updateLight(selectedLight.id, updates);
                          }}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                            selectedLight.shape === shape
                              ? 'bg-primary/20 text-primary'
                              : 'bg-muted text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />{label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Color</p>
                    <input type="color" value={selectedLight.color} onChange={(e) => updateLight(selectedLight.id, { color: e.target.value })} className="w-full h-8 rounded cursor-pointer border border-border" />
                  </div>

                  {/* Intensity */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Intensity: {Math.round(selectedLight.intensity * 100)}%</p>
                    <input type="range" min={0} max={200} value={Math.round(selectedLight.intensity * 100)} onChange={(e) => updateLight(selectedLight.id, { intensity: Number(e.target.value) / 100 })} className="w-full accent-primary" />
                  </div>

                  {/* Radius */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Radius: {Math.round(selectedLight.radius * 100)}%</p>
                    <input type="range" min={5} max={150} value={Math.round(selectedLight.radius * 100)} onChange={(e) => updateLight(selectedLight.id, { radius: Number(e.target.value) / 100 })} className="w-full accent-primary" />
                  </div>

                  {/* Height */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Height: {Math.round(selectedLight.z * 100)}%</p>
                    <input type="range" min={5} max={150} value={Math.round(selectedLight.z * 100)} onChange={(e) => updateLight(selectedLight.id, { z: Number(e.target.value) / 100 })} className="w-full accent-primary" />
                  </div>

                  {/* Depth position */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Depth: {selectedLight.dz <= 0.33 ? 'Behind' : selectedLight.dz >= 0.67 ? 'In Front' : 'Middle'}</p>
                    <input type="range" min={0} max={100} value={Math.round(selectedLight.dz * 100)} onChange={(e) => updateLight(selectedLight.id, { dz: Number(e.target.value) / 100 })} className="w-full accent-primary" />
                    <div className="flex justify-between text-[10px] text-muted-foreground -mt-0.5"><span>Behind</span><span>In Front</span></div>
                  </div>

                  {/* Spot-only controls */}
                  {selectedLight.shape === 'spot' && (
                    <>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Cone Angle: {selectedLight.coneAngle}&deg;</p>
                        <input type="range" min={15} max={60} value={selectedLight.coneAngle} onChange={(e) => updateLight(selectedLight.id, { coneAngle: Number(e.target.value) })} className="w-full accent-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Softness: {Math.round(selectedLight.softness * 100)}%</p>
                        <input type="range" min={0} max={100} value={Math.round(selectedLight.softness * 100)} onChange={(e) => updateLight(selectedLight.id, { softness: Number(e.target.value) / 100 })} className="w-full accent-primary" />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Global controls */}
              <div className="space-y-3 border-t border-border pt-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Ambient: {ambientIntensity}%</p>
                  <input type="range" min={0} max={100} value={ambientIntensity} onChange={(e) => setAmbientIntensity(Number(e.target.value))} className="w-full accent-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Overlay Opacity: {opacity}%</p>
                  <input type="range" min={0} max={100} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full accent-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Depth Influence: {depthInfluence}%</p>
                  <input type="range" min={0} max={100} value={depthInfluence} onChange={(e) => setDepthInfluence(Number(e.target.value))} className="w-full accent-primary" />
                  <p className="text-[10px] text-muted-foreground mt-0.5">Raised surfaces catch more light</p>
                </div>
                {showHighlightMap && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Highlight Threshold: {highlightThreshold}%</p>
                    <input type="range" min={10} max={95} value={highlightThreshold} onChange={(e) => setHighlightThreshold(Number(e.target.value))} className="w-full accent-primary" />
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#00ffff' }} />
                        <span className="text-[10px] text-muted-foreground">Strong highlight</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#ffe650' }} />
                        <span className="text-[10px] text-muted-foreground">Mid-tone</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom bar: view modes + actions */}
          <div className="flex flex-wrap items-center gap-2">
            {(['matcap', 'depth', 'original'] as ViewMode[]).map((mode) => (
              <Btn key={mode} size="sm" variant={viewMode === mode ? 'default' : 'outline'} onClick={() => setViewMode(mode)}>
                {mode === 'matcap' ? 'Lighting' : mode === 'depth' ? 'Depth Map' : 'Original'}
              </Btn>
            ))}
            <Btn size="sm" variant={showHandles ? 'outline' : 'default'} onClick={() => setShowHandles(!showHandles)}>
              {showHandles ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Btn>
            <Btn size="sm" variant={showHighlightMap ? 'default' : 'outline'} onClick={() => setShowHighlightMap(!showHighlightMap)}>
              <Sparkles className="w-4 h-4 mr-1" /> Highlights
            </Btn>
            <div className="flex-1" />
            <Btn size="sm" variant="outline" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" /> Download
            </Btn>
            <Btn size="sm" variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" /> New Image
            </Btn>
          </div>

          <p className="text-xs text-muted-foreground">
            Drag light handles on the image to reposition. Spotlights and line lights have a second draggable handle for aim/endpoint.
          </p>
        </div>
      )}
    </div>
  );
}
