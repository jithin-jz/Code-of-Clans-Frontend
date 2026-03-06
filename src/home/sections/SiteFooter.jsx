import React from "react";
import { Github, Linkedin, Twitter, Youtube } from "lucide-react";

const legalLinks = [
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Contact", href: "#" },
];

const socialLinks = [
  { label: "GitHub", href: "https://github.com", Icon: Github },
  { label: "LinkedIn", href: "https://linkedin.com", Icon: Linkedin },
  { label: "Twitter", href: "https://x.com", Icon: Twitter },
  { label: "YouTube", href: "https://youtube.com", Icon: Youtube },
];

const SiteFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-white/5 bg-black relative z-10">
      <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

        {/* Brand + socials */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="font-['Geist_Mono'] text-[10px] font-bold tracking-[0.2em] text-neutral-400 uppercase">
              Clash of Code
            </span>
          </div>

          <div className="hidden sm:block h-4 w-px bg-white/5" />

          <div className="flex items-center gap-5">
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="text-neutral-700 hover:text-neutral-300 transition-all duration-200 hover:scale-110"
              >
                {React.createElement(s.Icon, { size: 14, strokeWidth: 1.5 })}
              </a>
            ))}
          </div>
        </div>

        {/* Copyright + Legal */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="font-['Geist_Mono'] text-[9px] font-medium tracking-wider text-neutral-800 uppercase">
            © {year}
          </span>
          {legalLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-['Geist_Mono'] text-[9px] font-bold tracking-widest text-neutral-700 hover:text-neutral-400 transition-colors uppercase"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
