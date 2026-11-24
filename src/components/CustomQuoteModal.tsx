import { useEffect, useState } from 'react';
import { CheckCircle2, MessageCircle, Sparkles, X } from 'lucide-react';
import type { CustomQuoteRequest } from '../types/store';
import {
  buildWhatsAppQuoteUrl,
  validateCustomQuoteForm,
  type CustomQuoteInput,
} from '../utils/storeLogic';

interface CustomQuoteModalProps {
  open: boolean;
  defaultArtType?: string;
  onClose: () => void;
  onSubmitQuote: (quote: CustomQuoteRequest) => void;
}

const ART_TYPES = [
  'Wedding Varmala Preservation',
  'Geode Wall Clock',
  'Islamic Calligraphy / Home Nameplate',
  'Ocean Resin Serving Tray & Coasters',
  'Bridal Bouquet / Anniversary Keepsake',
  'Custom Bulk Wedding Return Favors',
];

const SIZE_PRESETS = [
  '8×8 Inch Block / Frame',
  '10×10 Inch Keepsake',
  '12×12 Inch Grand Block',
  '14 Inch Wall Clock / Tray',
  '18 Inch Statement Piece',
  'Custom Dimensions (Mentioned in Notes)',
];

export function CustomQuoteModal({
  open,
  defaultArtType,
  onClose,
  onSubmitQuote,
}: CustomQuoteModalProps) {
  const [form, setForm] = useState<CustomQuoteInput>({
    fullName: '',
    whatsapp: '',
    artType: defaultArtType || ART_TYPES[0],
    size: SIZE_PRESETS[1],
    preferredColors: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CustomQuoteInput, string>>>({});
  const [submittedQuote, setSubmittedQuote] = useState<CustomQuoteRequest | null>(null);

  useEffect(() => {
    if (open && defaultArtType) {
      const matched = ART_TYPES.find((t) =>
        t.toLowerCase().includes(defaultArtType.toLowerCase().split(' ')[0])
      );
      if (matched) {
        setForm((prev) => ({ ...prev, artType: matched }));
      }
    }
  }, [open, defaultArtType]);

  if (!open) return null;

  const handleClose = () => {
    setSubmittedQuote(null);
    setErrors({});
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateCustomQuoteForm(form);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    const quoteId = `QTE-${Math.floor(1000 + Math.random() * 9000)}`;
    const record: CustomQuoteRequest = {
      id: quoteId,
      ...form,
      createdAt: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    };
    setErrors({});
    setSubmittedQuote(record);
    onSubmitQuote(record);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#23191E]/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-quote-heading"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-[#23191E]/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#23191E]/10 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2
              id="custom-quote-heading"
              className="font-serif text-xl sm:text-2xl font-semibold text-[#23191E]"
            >
              Request a Custom Resin Quote
            </h2>
            <p className="text-xs text-[#5C4B52] mt-0.5">
              Varmala Preservation · Geode Clocks · Bespoke Home Nameplates
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close custom quote modal"
            className="p-2 rounded-lg text-[#5C4B52] hover:bg-[#FDF8F6] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedQuote ? (
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-[#2E6B4F]/12 text-[#2E6B4F] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-[#B76E79]">
                Reference #{submittedQuote.id}
              </p>
              <h3 className="mt-1 font-serif text-2xl font-semibold text-[#23191E]">
                Custom Quote Brief Received
              </h3>
              <p className="mt-2 text-sm text-[#5C4B52]">
                Thank you, <strong>{submittedQuote.fullName}</strong>. Fatima’s studio designer will reach out on{' '}
                <strong>{submittedQuote.whatsapp}</strong> within 4 business hours with pricing and layout options for your{' '}
                <strong>{submittedQuote.artType}</strong>.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={buildWhatsAppQuoteUrl(submittedQuote, submittedQuote.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 h-11 px-5 rounded-lg bg-[#25D366] hover:bg-[#1FB858] text-[#112A1B] text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Send Brief on WhatsApp Now</span>
              </a>
              <button
                type="button"
                onClick={handleClose}
                className="h-11 px-5 rounded-lg border border-[#23191E]/18 text-sm font-semibold text-[#23191E] hover:bg-[#FDF8F6] cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="quote-name" className="block text-xs font-semibold text-[#23191E] mb-1.5">
                  Your Name *
                </label>
                <input
                  id="quote-name"
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="e.g. Meera Kapoor"
                  className="w-full h-10 px-3.5 rounded-lg border border-[#23191E]/18 bg-[#FDF8F6] focus:bg-white focus:border-[#B76E79] text-sm"
                />
                {errors.fullName && <p className="mt-1 text-xs text-[#9B2C3E]">{errors.fullName}</p>}
              </div>

              <div>
                <label htmlFor="quote-whatsapp" className="block text-xs font-semibold text-[#23191E] mb-1.5">
                  Phone / WhatsApp Number *
                </label>
                <input
                  id="quote-whatsapp"
                  type="tel"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  placeholder="10-digit WhatsApp number"
                  className="w-full h-10 px-3.5 rounded-lg border border-[#23191E]/18 bg-[#FDF8F6] focus:bg-white focus:border-[#B76E79] text-sm tabular-nums"
                />
                {errors.whatsapp && <p className="mt-1 text-xs text-[#9B2C3E]">{errors.whatsapp}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="quote-art-type" className="block text-xs font-semibold text-[#23191E] mb-1.5">
                  Custom Art Type *
                </label>
                <select
                  id="quote-art-type"
                  value={form.artType}
                  onChange={(e) => setForm({ ...form, artType: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-[#23191E]/18 bg-[#FDF8F6] focus:bg-white focus:border-[#B76E79] text-sm"
                >
                  {ART_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.artType && <p className="mt-1 text-xs text-[#9B2C3E]">{errors.artType}</p>}
              </div>

              <div>
                <label htmlFor="quote-size" className="block text-xs font-semibold text-[#23191E] mb-1.5">
                  Preferred Size *
                </label>
                <select
                  id="quote-size"
                  value={form.size}
                  onChange={(e) => setForm({ ...form, size: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-[#23191E]/18 bg-[#FDF8F6] focus:bg-white focus:border-[#B76E79] text-sm"
                >
                  {SIZE_PRESETS.map((sz) => (
                    <option key={sz} value={sz}>
                      {sz}
                    </option>
                  ))}
                </select>
                {errors.size && <p className="mt-1 text-xs text-[#9B2C3E]">{errors.size}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="quote-colors" className="block text-xs font-semibold text-[#23191E] mb-1.5">
                Preferred Colours & Finishes *
              </label>
              <input
                id="quote-colors"
                type="text"
                value={form.preferredColors}
                onChange={(e) => setForm({ ...form, preferredColors: e.target.value })}
                placeholder="e.g. Ivory Pearl, Rose Gold, 24K Gold Leaf & Crushed Quartz"
                className="w-full h-10 px-3.5 rounded-lg border border-[#23191E]/18 bg-[#FDF8F6] focus:bg-white focus:border-[#B76E79] text-sm"
              />
              {errors.preferredColors && (
                <p className="mt-1 text-xs text-[#9B2C3E]">{errors.preferredColors}</p>
              )}
            </div>

            <div>
              <label htmlFor="quote-notes" className="block text-xs font-semibold text-[#23191E] mb-1.5">
                Personalization Notes / Wedding Date / Calligraphy Text
              </label>
              <textarea
                id="quote-notes"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Share wedding date, names to engrave, city for varmala courier pickup, or inspiration notes..."
                className="w-full p-3.5 rounded-lg border border-[#23191E]/18 bg-[#FDF8F6] focus:bg-white focus:border-[#B76E79] text-sm"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-lg border border-[#23191E]/18 text-sm font-medium text-[#23191E] hover:bg-[#FDF8F6] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#23191E] hover:bg-[#3A2931] text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#C59B27]" />
                <span>Submit Custom Request</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
