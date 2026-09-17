'use client';

import React, { useEffect, useRef, useState } from 'react';
import { supabaseRest } from '@/lib/supabase';
import { ArrowLeft, Headphones, Phone, Mail, MapPin, ShieldCheck, Clock3, UserRound, PencilLine, UploadCloud, Send, X } from 'lucide-react';

interface ComplaintViewProps { onBack: () => void; }

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];

export default function ComplaintView({ onBack }: ComplaintViewProps) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [orderId, setOrderId] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!image) {
      setImagePreview('');
      return;
    }
    const url = URL.createObjectURL(image);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const selectImage = (file: File | undefined) => {
    setImageError('');
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImage(null);
      setImageError('শুধু JPG, JPEG অথবা PNG ছবি দেওয়া যাবে।');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setImage(null);
      setImageError('ছবির সাইজ সর্বোচ্চ 2MB হতে হবে।');
      return;
    }
    setImage(file);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!name.trim() || !phone.trim() || !description.trim()) return;
    setIsSubmitting(true);
    try {
      let evidenceUrl: string | null = null;
      if (image) {
        const form = new FormData();
        form.append('file', image);
        form.append('upload_preset', 'bak9nabq');
        form.append('folder', 'fol_bazar_complaints');
        const upload = await fetch('https://api.cloudinary.com/v1_1/bak9nabq/image/upload', { method: 'POST', body: form });
        const data = await upload.json().catch(() => ({}));
        if (!upload.ok || !data.secure_url) throw new Error('ছবিটি আপলোড করা যায়নি। আবার চেষ্টা করুন।');
        evidenceUrl = String(data.secure_url);
      }
      await supabaseRest('rpc/create_public_complaint', {
        method: 'POST',
        body: JSON.stringify({
          payload: {
            customer_name: name.trim(),
            customer_phone: phone.trim(),
            order_id: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(orderId.trim()) ? orderId.trim() : null,
            subject: orderId.trim() && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(orderId.trim()) ? `Order reference: ${orderId.trim()}` : null,
            description: description.trim(),
            evidence_image_url: evidenceUrl,
          },
        }),
      });
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'কমপ্লেইন জমা দেওয়া যায়নি।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="complaint-page">
      <section className="complaint-hero">
        <Headphones size={38} />
        <h1>কমপ্লেইন করুন</h1>
        <p>হোম / কমপ্লেইন</p>
      </section>

      <main className="complaint-container">
        <div className="complaint-contact-card">
          <div className="complaint-contact-icon"><Headphones size={34} /></div>
          <h2>আমাদের সাথে যোগাযোগ করুন</h2>
          <p>যেকোনো সমস্যায় আমরা আপনার পাশে আছি। আপনার অভিযোগ জমা দিন, আমরা দ্রুত সমাধান দেবো।</p>
          <div className="complaint-contact-list">
            <a href="tel:01611870674"><span><Phone /></span><div><small>হটলাইন</small><strong>01611870674</strong></div></a>
            <a href="mailto:scaleuper@gmail.com"><span><Mail /></span><div><small>ইমেইল</small><strong>scaleuper@gmail.com</strong></div></a>
            <div><span><MapPin /></span><div><small>ঠিকানা</small><strong>Kamrangirchor, Dhaka, Bangladesh</strong></div></div>
          </div>
          <div className="complaint-trust-row">
            <span><ShieldCheck /> নিরাপদ ডাটা</span><span><Clock3 /> ২৪-৪৮ ঘণ্টার সমাধান</span><span><UserRound /> বিশ্বস্ত সেবা</span>
          </div>
        </div>

        <section className="complaint-form-card">
          <div className="complaint-form-title"><PencilLine /><div><h2>কমপ্লেইন ফর্ম</h2><p>নিচের ফর্মটি পূরণ করুন। সকল (*) চিহ্নিত ঘর পূরণ বাধ্যতামূলক।</p></div></div>
          {submitted ? (
            <div className="complaint-success"><ShieldCheck size={42}/><h3>আপনার কমপ্লেইন গ্রহণ করা হয়েছে</h3><p>আমাদের সাপোর্ট টিম দ্রুত আপনার সাথে যোগাযোগ করবে।</p><button type="button" onClick={onBack}>হোমে ফিরুন</button></div>
          ) : (
            <form onSubmit={submit}>
              <label>আপনার নাম <b>*</b><input value={name} onChange={e=>setName(e.target.value)} placeholder="আপনার নাম লিখুন" required /></label>
              <label>মোবাইল নম্বর <b>*</b><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="01XXXXXXXXX" type="tel" required /></label>
              <label>অর্ডার আইডি <span>(ঐচ্ছিক)</span><input value={orderId} onChange={e=>setOrderId(e.target.value)} placeholder="যেমন: FB-54321" /></label>
              <label>কমপ্লেইনের বিবরণ <b>*</b><textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="আপনার সমস্যাটি বিস্তারিত লিখুন..." rows={6} required /></label>
              <label>প্রমাণস্বরূপ ছবি <span>(ঐচ্ছিক)</span>
                <div className={`complaint-upload${image ? ' has-file' : ''}`} onClick={() => fileInputRef.current?.click()} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}>
                  <UploadCloud/>
                  <span>{image ? image.name : <>ছবি টেনে আনুন বা <strong>ব্রাউজ করুন</strong></>}<small>JPG, JPEG, PNG — সর্বোচ্চ 2MB</small></span>
                  <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" onChange={e=>selectImage(e.target.files?.[0])} onClick={e => e.stopPropagation()} />
                </div>
                {imageError && <div className="complaint-upload-error">{imageError}</div>}
                {imagePreview && <div className="complaint-image-preview"><img src={imagePreview} alt="নির্বাচিত অভিযোগের ছবি" /><button type="button" aria-label="ছবি সরান" onClick={() => { setImage(null); setImageError(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}><X size={16} /></button></div>}
              </label>
              <button className="complaint-submit" type="submit" disabled={isSubmitting}><Send/> {isSubmitting ? 'জমা হচ্ছে...' : 'কমপ্লেইন প্রেরণ'}</button>
              {submitError && <div className="complaint-upload-error">{submitError}</div>}
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
