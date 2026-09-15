'use client';

import React, { useState } from 'react';
import { ArrowLeft, Headphones, Phone, Mail, MapPin, ShieldCheck, Clock3, UserRound, PencilLine, UploadCloud, Send } from 'lucide-react';

interface ComplaintViewProps { onBack: () => void; }

export default function ComplaintView({ onBack }: ComplaintViewProps) {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [orderId, setOrderId] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !description.trim()) return;
    setSubmitted(true);
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
              <label>প্রমাণস্বরূপ ছবি <span>(ঐচ্ছিক)</span><div className="complaint-upload"><UploadCloud/><span>{image ? image.name : <>ছবি টেনে আনুন বা <strong>ব্রাউজ করুন</strong></>}<small>JPG, JPEG, PNG — সর্বোচ্চ 2MB</small></span><input type="file" accept="image/jpeg,image/png" onChange={e=>setImage(e.target.files?.[0] || null)} /></div></label>
              <button className="complaint-submit" type="submit"><Send/> কমপ্লেইন প্রেরণ</button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
