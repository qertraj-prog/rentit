'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Home, MapPin, IndianRupee, Zap, CheckCircle,
  ChevronRight, ChevronLeft, ArrowRight, Upload, AlertCircle
} from 'lucide-react'
import styles from './ListRoomClient.module.css'
import { AMENITY_CONFIG } from '@/lib/utils'

// ─── Step definitions ────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Property Type', icon: '🏠' },
  { id: 2, label: 'Location',      icon: '📍' },
  { id: 3, label: 'Pricing',       icon: '₹'  },
  { id: 4, label: 'Details',       icon: '📋' },
  { id: 5, label: 'Amenities',     icon: '✨' },
  { id: 6, label: 'Photos',        icon: '📷' },
  { id: 7, label: 'Review',        icon: '🚀' },
]

const ROOM_TYPES = [
  { value: 'single', label: 'Single Room', emoji: '🛏️', desc: 'Private room for 1 person' },
  { value: 'double', label: 'Double Room', emoji: '🛏️🛏️', desc: 'Shared room for 2 people' },
  { value: 'triple', label: 'Triple Sharing', emoji: '👥', desc: 'Shared room for 3 people' },
  { value: '1bhk',   label: '1 BHK',        emoji: '🏡', desc: '1 bedroom flat' },
  { value: '2bhk',   label: '2 BHK',        emoji: '🏢', desc: '2 bedroom flat' },
  { value: 'pg',     label: 'PG / Hostel',  emoji: '🏫', desc: 'Paying guest accommodation' },
]

const GENDER_OPTIONS = [
  { value: 'boys',   label: 'Boys Only',   emoji: '👨' },
  { value: 'girls',  label: 'Girls Only',  emoji: '👩' },
  { value: 'any',    label: 'Any / Both',  emoji: '👫' },
  { value: 'family', label: 'Family Only', emoji: '🏡' },
]

const FURNISHING_OPTIONS = [
  { value: 'fully_furnished', label: 'Fully Furnished',  emoji: '🛋️', desc: 'Bed, wardrobe, table, chair & more' },
  { value: 'semi_furnished',  label: 'Semi Furnished',   emoji: '🪑', desc: 'Some furniture provided' },
  { value: 'unfurnished',     label: 'Unfurnished',      emoji: '🏠', desc: 'Empty room / flat' },
]

const AMENITY_KEYS = Object.keys(AMENITY_CONFIG)

interface FormData {
  // Step 1
  room_type: string
  gender_preference: string
  // Step 2
  address: string
  colony: string
  landmark: string
  city: string
  pincode: string
  state: string
  floor_number: string
  total_floors: string
  // Step 3
  monthly_rent: string
  security_deposit: string
  available_from: string
  notice_period_days: string
  // Step 4
  title: string
  description: string
  room_size_sqft: string
  furnishing_type: string
  bathroom_type: string
  electricity_included: boolean
  water_supply: string
  parking: boolean
  food_available: boolean
  food_type: string
  pets_allowed: boolean
  // Step 5
  amenities: string[]
  // Step 6
  photos: File[]
  // Contact
  owner_name: string
  owner_phone: string
}

const INITIAL: FormData = {
  room_type: '', gender_preference: '',
  address: '', colony: '', landmark: '', city: 'Noida', pincode: '', state: 'Uttar Pradesh',
  floor_number: '', total_floors: '',
  monthly_rent: '', security_deposit: '', available_from: '', notice_period_days: '30',
  title: '', description: '', room_size_sqft: '',
  furnishing_type: '', bathroom_type: '',
  electricity_included: false, water_supply: '24x7',
  parking: false, food_available: false, food_type: '', pets_allowed: false,
  amenities: [],
  photos: [],
  owner_name: '', owner_phone: '',
}

export default function ListRoomClient() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof FormData, val: unknown) =>
    setForm(f => ({ ...f, [key]: val }))

  const toggleAmenity = (key: string) =>
    set('amenities', form.amenities.includes(key)
      ? form.amenities.filter(a => a !== key)
      : [...form.amenities, key])

  // Per-step validation
  const canProceed = () => {
    if (step === 1) return !!form.room_type && !!form.gender_preference
    if (step === 2) return !!form.address && !!form.city && !!form.pincode
    if (step === 3) return !!form.monthly_rent && !!form.security_deposit && !!form.available_from
    if (step === 4) return !!form.title && !!form.furnishing_type && !!form.bathroom_type
    return true
  }

  const next = () => { if (canProceed()) setStep(s => Math.min(s + 1, 7)) }
  const back = () => setStep(s => Math.max(s - 1, 1))

  const handleSubmit = async () => {
    if (!form.owner_name || !form.owner_phone) {
      setError('Please enter your name and phone number.')
      return
    }
    if (form.owner_phone.replace(/\D/g, '').length < 10) {
      setError('Valid 10-digit phone number required.')
      return
    }
    setError('')
    setSubmitting(true)

    try {
      const fd = new FormData()
      // Append all text fields
      const textFields = [
        'title','description','room_type','gender_preference',
        'monthly_rent','security_deposit','available_from','notice_period_days',
        'address','city','state','colony','landmark','pincode',
        'floor_number','total_floors','room_size_sqft',
        'furnishing_type','bathroom_type','water_supply','food_type',
        'owner_name','owner_phone',
      ] as const
      textFields.forEach(k => fd.append(k, String(form[k] ?? '')))

      // Booleans
      fd.append('electricity_included', String(form.electricity_included))
      fd.append('parking',              String(form.parking))
      fd.append('food_available',       String(form.food_available))
      fd.append('pets_allowed',         String(form.pets_allowed))
      fd.append('amenities',            JSON.stringify(form.amenities))

      // Photos
      form.photos.forEach(f => fd.append('photos', f))

      const res = await fetch('/api/list-room', { method: 'POST', body: fd })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error || 'Submission failed. Try again.')
        setSubmitting(false)
        return
      }

      setSubmitting(false)
      setSubmitted(true)
    } catch {
      setError('Network error. Please check your connection and try again.')
      setSubmitting(false)
    }
  }

  if (submitted) return <SuccessScreen onHome={() => router.push('/')} />

  const progress = ((step - 1) / (STEPS.length - 1)) * 100

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          <div>
            <h1 className={styles.headerTitle}>List Your Property</h1>
            <p className={styles.headerSub}>Free listing · Direct tenant connect · No brokerage</p>
          </div>
          <div className={styles.stepCount}>Step {step} of {STEPS.length}</div>
        </div>
        {/* Progress bar */}
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Step pills */}
      <div className={styles.stepNav}>
        <div className={`container ${styles.stepNavInner}`}>
          {STEPS.map(s => (
            <button
              key={s.id}
              className={`${styles.stepPill} ${step === s.id ? styles.stepPillActive : ''} ${step > s.id ? styles.stepPillDone : ''}`}
              onClick={() => step > s.id && setStep(s.id)}
              disabled={step < s.id}
            >
              {step > s.id ? <CheckCircle size={13} /> : <span>{s.icon}</span>}
              <span className={styles.stepPillLabel}>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={`container ${styles.formWrap}`}>
        <div className={styles.formCard}>

          {/* ── STEP 1: Property Type ── */}
          {step === 1 && (
            <div className={styles.stepBody}>
              <StepTitle icon="🏠" title="What type of property?" sub="Select the room / flat type you're listing" />

              <div className={styles.cardGrid}>
                {ROOM_TYPES.map(rt => (
                  <button
                    key={rt.value}
                    className={`${styles.selCard} ${form.room_type === rt.value ? styles.selCardActive : ''}`}
                    onClick={() => set('room_type', rt.value)}
                  >
                    <span className={styles.selEmoji}>{rt.emoji}</span>
                    <span className={styles.selLabel}>{rt.label}</span>
                    <span className={styles.selDesc}>{rt.desc}</span>
                  </button>
                ))}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Preferred Tenant</label>
                <div className={styles.optionRow}>
                  {GENDER_OPTIONS.map(g => (
                    <button
                      key={g.value}
                      className={`${styles.optBtn} ${form.gender_preference === g.value ? styles.optBtnActive : ''}`}
                      onClick={() => set('gender_preference', g.value)}
                    >
                      {g.emoji} {g.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Location ── */}
          {step === 2 && (
            <div className={styles.stepBody}>
              <StepTitle icon="📍" title="Where is your property?" sub="Accurate address helps tenants find you faster" />

              <div className={styles.fieldGrid2}>
                <Field label="City *" hint="Currently launching in Noida">
                  <input className={styles.input} value={form.city}
                    onChange={e => set('city', e.target.value)} placeholder="e.g. Noida" />
                </Field>
                <Field label="Pincode *">
                  <input className={styles.input} value={form.pincode} maxLength={6}
                    onChange={e => set('pincode', e.target.value)} placeholder="e.g. 201301" />
                </Field>
              </div>

              <Field label="Full Address *">
                <input className={styles.input} value={form.address}
                  onChange={e => set('address', e.target.value)}
                  placeholder="House / Flat no., Building name, Street" />
              </Field>

              <div className={styles.fieldGrid2}>
                <Field label="Colony / Area">
                  <input className={styles.input} value={form.colony}
                    onChange={e => set('colony', e.target.value)} placeholder="e.g. Sector 62" />
                </Field>
                <Field label="Landmark">
                  <input className={styles.input} value={form.landmark}
                    onChange={e => set('landmark', e.target.value)} placeholder="e.g. Near Metro Station" />
                </Field>
              </div>

              <div className={styles.fieldGrid2}>
                <Field label="State">
                  <input className={styles.input} value={form.state}
                    onChange={e => set('state', e.target.value)} placeholder="e.g. Uttar Pradesh" />
                </Field>
                <Field label="Floor Number">
                  <input className={styles.input} type="number" value={form.floor_number}
                    onChange={e => set('floor_number', e.target.value)} placeholder="e.g. 2" />
                </Field>
              </div>

              <Field label="Total Floors in Building">
                <input className={styles.input} type="number" value={form.total_floors}
                  onChange={e => set('total_floors', e.target.value)} placeholder="e.g. 5" />
              </Field>
            </div>
          )}

          {/* ── STEP 3: Pricing ── */}
          {step === 3 && (
            <div className={styles.stepBody}>
              <StepTitle icon="₹" title="Rent & Availability" sub="Set competitive pricing to attract tenants faster" />

              <div className={styles.fieldGrid2}>
                <Field label="Monthly Rent (₹) *">
                  <div className={styles.inputPrefix}>
                    <IndianRupee size={15} />
                    <input className={styles.input} type="number" value={form.monthly_rent}
                      onChange={e => set('monthly_rent', e.target.value)} placeholder="e.g. 8000" />
                  </div>
                </Field>
                <Field label="Security Deposit (₹) *">
                  <div className={styles.inputPrefix}>
                    <IndianRupee size={15} />
                    <input className={styles.input} type="number" value={form.security_deposit}
                      onChange={e => set('security_deposit', e.target.value)} placeholder="e.g. 16000" />
                  </div>
                </Field>
              </div>

              <div className={styles.fieldGrid2}>
                <Field label="Available From *">
                  <input className={styles.input} type="date" value={form.available_from}
                    onChange={e => set('available_from', e.target.value)} />
                </Field>
                <Field label="Notice Period (days)">
                  <input className={styles.input} type="number" value={form.notice_period_days}
                    onChange={e => set('notice_period_days', e.target.value)} placeholder="30" />
                </Field>
              </div>

              <div className={styles.infoBox}>
                <Zap size={15} />
                <span>Tip: Security deposit is usually 1–2 months of rent. Fair pricing = faster tenant.</span>
              </div>
            </div>
          )}

          {/* ── STEP 4: Details ── */}
          {step === 4 && (
            <div className={styles.stepBody}>
              <StepTitle icon="📋" title="Room Details" sub="More details = more trust = faster rental" />

              <Field label="Listing Title *">
                <input className={styles.input} value={form.title}
                  onChange={e => set('title', e.target.value)}
                  placeholder="e.g. Furnished Single Room near Sector 62 Metro" />
              </Field>

              <Field label="Description">
                <textarea className={`${styles.input} ${styles.textarea}`} value={form.description}
                  onChange={e => set('description', e.target.value)}
                  rows={4} placeholder="Describe your room — view, nearby facilities, rules, etc." />
              </Field>

              <div className={styles.fieldGrid2}>
                <Field label="Room Size (sq ft)">
                  <input className={styles.input} type="number" value={form.room_size_sqft}
                    onChange={e => set('room_size_sqft', e.target.value)} placeholder="e.g. 120" />
                </Field>
                <Field label="Bathroom Type *">
                  <div className={styles.optionRow}>
                    {[{ v: 'attached', l: '🚿 Attached' }, { v: 'shared', l: '🚪 Shared' }].map(b => (
                      <button key={b.v}
                        className={`${styles.optBtn} ${form.bathroom_type === b.v ? styles.optBtnActive : ''}`}
                        onClick={() => set('bathroom_type', b.v)}>
                        {b.l}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>

              <Field label="Furnishing *">
                <div className={styles.cardGrid}>
                  {FURNISHING_OPTIONS.map(f => (
                    <button key={f.value}
                      className={`${styles.selCard} ${form.furnishing_type === f.value ? styles.selCardActive : ''}`}
                      onClick={() => set('furnishing_type', f.value)}>
                      <span className={styles.selEmoji}>{f.emoji}</span>
                      <span className={styles.selLabel}>{f.label}</span>
                      <span className={styles.selDesc}>{f.desc}</span>
                    </button>
                  ))}
                </div>
              </Field>

              <div className={styles.toggleGrid}>
                <Toggle label="Electricity Included" value={form.electricity_included}
                  onChange={v => set('electricity_included', v)} />
                <Toggle label="Parking Available" value={form.parking}
                  onChange={v => set('parking', v)} />
                <Toggle label="Pets Allowed" value={form.pets_allowed}
                  onChange={v => set('pets_allowed', v)} />
                <Toggle label="Food Available" value={form.food_available}
                  onChange={v => set('food_available', v)} />
              </div>

              {form.food_available && (
                <Field label="Food Type">
                  <div className={styles.optionRow}>
                    {[{ v: 'veg', l: '🥦 Veg' }, { v: 'non_veg', l: '🍗 Non-Veg' }, { v: 'both', l: '🍱 Both' }].map(f => (
                      <button key={f.v}
                        className={`${styles.optBtn} ${form.food_type === f.v ? styles.optBtnActive : ''}`}
                        onClick={() => set('food_type', f.v)}>
                        {f.l}
                      </button>
                    ))}
                  </div>
                </Field>
              )}

              <Field label="Water Supply">
                <div className={styles.optionRow}>
                  {[{ v: '24x7', l: '💧 24×7' }, { v: 'limited', l: '⏱️ Limited Hours' }].map(w => (
                    <button key={w.v}
                      className={`${styles.optBtn} ${form.water_supply === w.v ? styles.optBtnActive : ''}`}
                      onClick={() => set('water_supply', w.v)}>
                      {w.l}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {/* ── STEP 5: Amenities ── */}
          {step === 5 && (
            <div className={styles.stepBody}>
              <StepTitle icon="✨" title="Amenities" sub="Select all that apply — tenants love complete info" />
              <div className={styles.amenityGrid}>
                {AMENITY_KEYS.map(key => {
                  const cfg = AMENITY_CONFIG[key]
                  const active = form.amenities.includes(key)
                  return (
                    <button key={key}
                      className={`${styles.amenityChip} ${active ? styles.amenityChipActive : ''}`}
                      onClick={() => toggleAmenity(key)}>
                      <span className={styles.amenityEmoji}>{cfg.icon}</span>
                      <span>{cfg.label}</span>
                      {active && <CheckCircle size={13} className={styles.amenityCheck} />}
                    </button>
                  )
                })}
              </div>
              <p className={styles.selCount}>{form.amenities.length} amenities selected</p>
            </div>
          )}

          {/* ── STEP 6: Photos ── */}
          {step === 6 && (
            <div className={styles.stepBody}>
              <StepTitle icon="📷" title="Add Photos" sub="Listings with photos get 5× more inquiries" />

              <label className={styles.uploadZone}>
                <Upload size={32} className={styles.uploadIcon} />
                <p className={styles.uploadText}>Click to upload photos</p>
                <p className={styles.uploadHint}>JPG, PNG up to 5MB each · Max 10 photos</p>
                <input type="file" accept="image/*" multiple hidden
                  onChange={e => {
                    const files = Array.from(e.target.files || []).slice(0, 10)
                    set('photos', files)
                  }} />
              </label>

              {form.photos.length > 0 && (
                <div className={styles.photoPreviewGrid}>
                  {form.photos.map((f, i) => (
                    <div key={i} className={styles.photoThumb}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={URL.createObjectURL(f)} alt={`Photo ${i + 1}`} />
                      {i === 0 && <span className={styles.coverBadge}>Cover</span>}
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.infoBox}>
                <AlertCircle size={15} />
                <span>First photo will be used as the cover image. Drag to reorder (coming soon).</span>
              </div>
            </div>
          )}

          {/* ── STEP 7: Review & Submit ── */}
          {step === 7 && (
            <div className={styles.stepBody}>
              <StepTitle icon="🚀" title="Almost there!" sub="Review your listing and enter contact details" />

              {/* Summary cards */}
              <div className={styles.reviewGrid}>
                <ReviewItem label="Property Type" value={form.room_type.toUpperCase()} />
                <ReviewItem label="Preferred Tenant" value={form.gender_preference} />
                <ReviewItem label="City" value={form.city} />
                <ReviewItem label="Pincode" value={form.pincode} />
                <ReviewItem label="Monthly Rent" value={`₹${Number(form.monthly_rent).toLocaleString('en-IN')}`} />
                <ReviewItem label="Security Deposit" value={`₹${Number(form.security_deposit).toLocaleString('en-IN')}`} />
                <ReviewItem label="Available From" value={form.available_from} />
                <ReviewItem label="Furnishing" value={form.furnishing_type.replace('_', ' ')} />
                <ReviewItem label="Bathroom" value={form.bathroom_type} />
                <ReviewItem label="Amenities" value={`${form.amenities.length} selected`} />
                <ReviewItem label="Photos" value={`${form.photos.length} uploaded`} />
              </div>

              {/* Contact section */}
              <div className={styles.contactSection}>
                <h3 className={styles.contactTitle}>📞 Your Contact Details</h3>
                <p className={styles.contactSub}>Tenants will use this to reach you directly</p>
                <div className={styles.fieldGrid2}>
                  <Field label="Your Full Name *">
                    <input className={styles.input} value={form.owner_name}
                      onChange={e => set('owner_name', e.target.value)}
                      placeholder="e.g. Rahul Sharma" />
                  </Field>
                  <Field label="WhatsApp / Phone *">
                    <input className={styles.input} type="tel" maxLength={10} value={form.owner_phone}
                      onChange={e => set('owner_phone', e.target.value)}
                      placeholder="10-digit mobile number" />
                  </Field>
                </div>
              </div>

              {error && (
                <div className={styles.errorBox}>
                  <AlertCircle size={15} /> {error}
                </div>
              )}

              <button
                className={`${styles.submitBtn} ${submitting ? styles.submitting : ''}`}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <><span className={styles.spinner} /> Submitting listing...</>
                ) : (
                  <>🎉 Submit Listing for Review <ArrowRight size={18} /></>
                )}
              </button>

              <p className={styles.submitNote}>
                Your listing will be reviewed within 24 hours and published after verification.
              </p>
            </div>
          )}

          {/* Navigation buttons */}
          <div className={styles.navButtons}>
            {step > 1 && (
              <button className={styles.backBtn} onClick={back}>
                <ChevronLeft size={18} /> Back
              </button>
            )}
            {step < 7 && (
              <button
                className={`${styles.nextBtn} ${!canProceed() ? styles.nextBtnDisabled : ''}`}
                onClick={next}
                disabled={!canProceed()}
              >
                Continue <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Small helpers ────────────────────────────────────────────────────────────
function StepTitle({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div className={styles.stepTitle}>
      <span className={styles.stepTitleIcon}>{icon}</span>
      <div>
        <h2 className={styles.stepTitleText}>{title}</h2>
        <p className={styles.stepTitleSub}>{sub}</p>
      </div>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.label}>{label}</label>
      {hint && <span className={styles.fieldHint}>{hint}</span>}
      {children}
    </div>
  )
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button className={`${styles.toggleBtn} ${value ? styles.toggleBtnOn : ''}`} onClick={() => onChange(!value)}>
      <span className={styles.toggleLabel}>{label}</span>
      <span className={styles.toggleTrack}>
        <span className={styles.toggleThumb} />
      </span>
    </button>
  )
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.reviewItem}>
      <span className={styles.reviewLabel}>{label}</span>
      <span className={styles.reviewValue}>{value || '—'}</span>
    </div>
  )
}

function SuccessScreen({ onHome }: { onHome: () => void }) {
  return (
    <div className={styles.successPage}>
      <div className={styles.successCard}>
        <div className={styles.successEmoji}>🎉</div>
        <h2 className={styles.successTitle}>Listing Submitted!</h2>
        <p className={styles.successSub}>
          Your property is under review. We'll verify and publish it within 24 hours.
          You'll receive a call/SMS once it's live.
        </p>
        <div className={styles.successSteps}>
          <div className={styles.successStep}><CheckCircle size={16} /> Listing received</div>
          <div className={styles.successStep}><Home size={16} /> Admin verification (24h)</div>
          <div className={styles.successStep}><Zap size={16} /> Goes live on RentIt</div>
        </div>
        <button className={styles.submitBtn} onClick={onHome}>
          Back to Home <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
