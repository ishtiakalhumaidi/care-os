/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ImagePlus,
  Loader2,
  Calendar,
  X,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  UploadCloud,
  Camera,
} from "lucide-react";
import { getChildMedia, uploadChildMedia, deleteChildMedia } from "@/services/media.services";
import Image from "next/image";
import { motion, AnimatePresence, type Variants } from "framer-motion";

/* ─── animation variants ─── */
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

/* ─── skeletons ─── */
function SkeletonPulse({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}

function GallerySkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <SkeletonPulse key={i} className="aspect-square rounded-xl" />
      ))}
    </div>
  );
}

/* ─── masonry grid item ─── */
function MasonryItem({
  media,
  index,
  onClick,
}: {
  media: any;
  index: number;
  onClick: () => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <motion.div
      variants={fadeInUp}
      custom={index}
      layout
      className="group relative cursor-pointer overflow-hidden rounded-xl border border-border bg-muted"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative aspect-square">
        {!isLoaded && <SkeletonPulse className="absolute inset-0" />}
        <Image
          src={media.url}
          alt={media.caption || "Child moment"}
          fill
          className={`object-cover transition-all duration-500 group-hover:scale-110 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          onLoad={() => setIsLoaded(true)}
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute bottom-0 left-0 right-0 p-3">
            {media.caption && (
              <p className="line-clamp-2 text-xs font-medium text-white/90">
                {media.caption}
              </p>
            )}
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-white/60">
              <span className="flex items-center gap-1">
                <Calendar className="size-3" />
                {new Date(media.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span>{media.uploader?.name?.split(" ")[0]}</span>
            </div>
          </div>
        </div>

        {/* Zoom icon on hover */}
        <div className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100">
          <ZoomIn className="size-4" />
        </div>
      </div>
    </motion.div>
  );
}

/* ─── upload zone ─── */
function UploadZone({
  onFileSelect,
  isDragging,
  setIsDragging,
}: {
  onFileSelect: (file: File) => void;
  isDragging: boolean;
  setIsDragging: (v: boolean) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    },
    [setIsDragging]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
    },
    [setIsDragging]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        onFileSelect(file);
      } else if (file) {
        toast.error("Please drop an image file");
      }
    },
    [onFileSelect, setIsDragging]
  );

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-8 transition-all sm:p-10 ${
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border bg-card hover:border-primary/50 hover:bg-muted/30"
      }`}
    >
      <div className="flex flex-col items-center justify-center text-center">
        <div
          className={`flex size-14 items-center justify-center rounded-2xl transition-colors ${
            isDragging ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground group-hover:text-primary"
          }`}
        >
          {isDragging ? (
            <UploadCloud className="size-7" />
          ) : (
            <ImagePlus className="size-7" />
          )}
        </div>
        <p className="mt-4 text-sm font-semibold text-foreground">
          {isDragging ? "Drop photo here" : "Click or drag photo here"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          PNG, JPG, WEBP up to 10MB
        </p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
        }}
        className="hidden"
      />
    </div>
  );
}

/* ─── lightbox ─── */
function Lightbox({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
  onDelete,
  canDelete,
  isDeleting,
}: {
  images: any[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onDelete: () => void;
  canDelete: boolean;
  isDeleting: boolean;
}) {
  const currentImage = images[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, onNext, onPrev]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md"
      onClick={onClose}
    >
      {/* Top bar */}
      <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between p-4 sm:p-6">
        <div className="flex items-center gap-3 text-white/70">
          <span className="text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toast.error("Delete this photo?", {
                  description: "This action cannot be undone.",
                  action: {
                    label: "Yes, delete",
                    onClick: onDelete,
                  },
                });
              }}
              disabled={isDeleting}
              className="flex size-10 items-center justify-center rounded-full bg-white/10 text-red-400 transition-all hover:bg-white/20 hover:text-red-300 disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Trash2 className="size-5" />
              )}
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Trigger download
              const a = document.createElement("a");
              a.href = currentImage.url;
              a.download = currentImage.caption || "photo";
              a.click();
            }}
            className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white/70 transition-all hover:bg-white/20 hover:text-white"
          >
            <Download className="size-5" />
          </button>
          <button
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white/70 transition-all hover:bg-white/20 hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-2 top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white/70 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white sm:left-6"
          >
            <ChevronLeft className="size-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-2 top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white/70 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white sm:right-6"
          >
            <ChevronRight className="size-6" />
          </button>
        </>
      )}

      {/* Image */}
      <motion.div
        key={currentImage.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative flex h-full w-full max-w-6xl flex-col items-center justify-center px-4 py-20 sm:px-20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-[60vh] w-full sm:h-[70vh]">
          <Image
            src={currentImage.url}
            alt={currentImage.caption || "Full view"}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
        </div>

        {/* Caption bar */}
        <div className="mt-6 max-w-2xl text-center">
          {currentImage.caption && (
            <p className="text-lg font-semibold text-white/90">
              {currentImage.caption}
            </p>
          )}
          <div className="mt-2 flex items-center justify-center gap-3 text-sm text-white/50">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-4" />
              {new Date(currentImage.createdAt).toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="size-1 rounded-full bg-white/30" />
            <span>by {currentImage.uploader?.name}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── main component ─── */
export default function ChildGallery({
  childId,
  currentUserRole,
}: {
  childId: string;
  currentUserRole: string;
}) {
  const queryClient = useQueryClient();
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const isStaff = ["TEACHER", "CENTER_ADMIN", "TENANT_OWNER", "SUPER_ADMIN"].includes(
    currentUserRole
  );

  const { data: mediaResponse, isLoading } = useQuery({
    queryKey: ["child-media", childId],
    queryFn: () => getChildMedia(childId),
  });

  const mediaList = mediaResponse?.data || [];

  const { mutate: upload, isPending } = useMutation({
    mutationFn: (formData: FormData) => uploadChildMedia(childId, formData),
    onSuccess: () => {
      toast.success("Photo added to gallery!");
      setPreview(null);
      setCaption("");
      queryClient.invalidateQueries({ queryKey: ["child-media", childId] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to upload photo.");
    },
  });

  const { mutate: deleteMedia, isPending: isDeleting } = useMutation({
    mutationFn: (mediaId: string) => deleteChildMedia(mediaId),
    onSuccess: () => {
      toast.success("Photo deleted.");
      setSelectedIndex(null);
      queryClient.invalidateQueries({ queryKey: ["child-media", childId] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete photo.");
    },
  });

  const handleFileSelect = useCallback(
    (file: File) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image must be under 10MB.");
        return;
      }
      setPreview({ file, url: URL.createObjectURL(file) });
    },
    []
  );

  const handleUpload = () => {
    if (!preview) return;
    const formData = new FormData();
    formData.append("file", preview.file);
    if (caption) formData.append("caption", caption);
    upload(formData);
  };

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % mediaList.length);
  }, [selectedIndex, mediaList.length]);

  const handlePrev = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + mediaList.length) % mediaList.length);
  }, [selectedIndex, mediaList.length]);

  const selectedImage = selectedIndex !== null ? mediaList[selectedIndex] : null;
  const canDeleteSelected =
    selectedImage &&
    (selectedImage.uploadedBy === currentUserRole || isStaff);

  return (
    <div className="space-y-6">
      {/* Upload Section for Staff */}
      {isStaff && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {!preview ? (
            <UploadZone
              onFileSelect={handleFileSelect}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row">
                <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border sm:w-48 shrink-0">
                  <Image
                    src={preview.url}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                      Caption <span className="font-normal text-muted-foreground">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="E.g., Painting session during art class!"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      disabled={isPending}
                    />
                    <p className="text-xs text-muted-foreground">
                      Add a description to help parents remember this moment.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => setPreview(null)}
                      disabled={isPending}
                      className="rounded-xl px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={isPending}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
                    >
                      {isPending && <Loader2 className="size-4 animate-spin" />}
                      {isPending ? "Uploading..." : "Save to Gallery"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Gallery Grid */}
      {isLoading ? (
        <GallerySkeleton />
      ) : mediaList.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex min-h-[20rem] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center"
        >
          <div className="relative">
            <div className="absolute inset-0 size-16 rounded-full bg-muted/50 blur-xl" />
            <div className="relative flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Camera className="size-7" />
            </div>
          </div>
          <h3 className="mt-5 text-base font-bold text-foreground">No photos yet</h3>
          <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
            Moments captured by teachers will appear here. Check back soon for new memories.
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        >
          <AnimatePresence>
            {mediaList.map((media: any, index: number) => (
              <MasonryItem
                key={media.id}
                media={media}
                index={index}
                onClick={() => setSelectedIndex(index)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <Lightbox
            images={mediaList}
            currentIndex={selectedIndex}
            onClose={() => setSelectedIndex(null)}
            onNext={handleNext}
            onPrev={handlePrev}
            onDelete={() => selectedImage && deleteMedia(selectedImage.id)}
            canDelete={!!canDeleteSelected}
            isDeleting={isDeleting}
          />
        )}
      </AnimatePresence>
    </div>
  );
}