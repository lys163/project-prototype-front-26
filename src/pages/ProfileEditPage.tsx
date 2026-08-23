import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Camera, User, ArrowLeft, Save, Mail, Loader2 } from "lucide-react";
import { fetchUserMe, isLoggedIn, updateUserProfile } from "../lib/auth";
import { uploadUserFile } from "../lib/storage";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const ProfileEditPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  // 서버에 저장될 값 (objectKey 또는 기존 URL)
  const [profileImage, setProfileImage] = useState("");
  // 화면 표시용 URL (blob: 또는 원본 URL)
  const [previewUrl, setPreviewUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
    fetchUserMe().then((data) => {
      if (!data) {
        navigate("/login");
        return;
      }
      setName(data.nickname ?? "");
      setEmail(data.email ?? "");
      setProfileImage(data.profileImage ?? "");
      setPreviewUrl(data.profileImage ?? "");
      setLoading(false);
    });
  }, [navigate]);

  // blob URL 메모리 정리 — previewUrl이 바뀌거나 언마운트 시 이전 blob 해제
  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const openFilePicker = () => {
    if (isUploading || isSaving) return;
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError("이미지 크기는 5MB 이하여야 합니다.");
      return;
    }

    setError(null);
    // 즉시 미리보기 (이전 blob은 useEffect cleanup이 revoke)
    setPreviewUrl(URL.createObjectURL(file));
    setIsUploading(true);

    try {
      const objectKey = await uploadUserFile(file);
      setProfileImage(objectKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : "이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
      // 같은 파일 재선택 가능하도록 input 리셋
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) {
      setError("이미지 업로드가 완료될 때까지 기다려주세요.");
      return;
    }

    setError(null);
    setIsSaving(true);
    try {
      await updateUserProfile({ nickname: name, email, profileImage });
      navigate("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-20 px-4 md:px-6 bg-surface">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white transition-colors"
            >
              <ArrowLeft size={20} className="text-on-surface" />
            </button>
            <h1 className="text-3xl font-display font-bold">프로필 수정</h1>
          </div>

          <div className="glass-card rounded-3xl p-6 md:p-10 shadow-[0px_20px_40px_rgba(39,48,87,0.06)] border border-white/20">
            <form onSubmit={handleSave} className="space-y-8">
              {/* Profile Picture Edit */}
              <div className="flex flex-col items-center space-y-4">
                <button
                  type="button"
                  onClick={openFilePicker}
                  disabled={isUploading || isSaving}
                  className="relative group cursor-pointer disabled:cursor-wait"
                  aria-label="프로필 사진 변경"
                >
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary shadow-xl">
                    <img
                      src={previewUrl || "https://i.pravatar.cc/150?u=default"}
                      alt="프로필"
                      className="w-full h-full object-cover group-hover:opacity-50 transition-opacity"
                    />
                  </div>
                  <div
                    className={`absolute inset-0 flex items-center justify-center rounded-full transition-opacity ${
                      isUploading
                        ? "opacity-100 bg-black/40"
                        : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {isUploading ? (
                      <Loader2 size={32} className="text-white animate-spin drop-shadow-md" />
                    ) : (
                      <Camera size={32} className="text-white drop-shadow-md" />
                    )}
                  </div>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={openFilePicker}
                  disabled={isUploading || isSaving}
                  className="text-sm font-bold text-primary hover:underline disabled:opacity-50"
                >
                  {isUploading ? "업로드 중..." : "사진 변경하기"}
                </button>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                {/* Name Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-on-surface ml-1 font-label">
                    이름
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary rounded-xl px-4 py-3 pl-11 text-on-surface transition-all outline-none font-medium"
                      required
                    />
                    <User
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50"
                      size={20}
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-on-surface ml-1 font-label">
                    이메일
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary rounded-xl px-4 py-3 pl-11 text-on-surface transition-all outline-none font-medium"
                    />
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50"
                      size={20}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="flex-1 py-4 glass rounded-xl font-bold hover:bg-white transition-all text-on-surface"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isUploading}
                  className="flex-1 py-4 bg-primary text-white rounded-xl font-bold shadow-lg hover:bg-secondary transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={20} />
                      저장하기
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileEditPage;
