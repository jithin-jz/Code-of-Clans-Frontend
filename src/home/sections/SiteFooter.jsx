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
    <footer className="w-full border-t border-white/[0.04] bg-[#0a0f18]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-4">
          <p className="text-[11px] text-slate-500 font-medium tracking-wide">
            © {year} CLASH OF CODE
          </p>
          <div className="hidden sm:block h-3 w-[1px] bg-white/[0.1]"></div>
          <div className="flex items-center gap-3">
            {socialLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                aria-label={item.label}
                className="text-slate-500 hover:text-white transition-colors duration-200"
              >
                {React.createElement(item.Icon, { size: 14 })}
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
          <div className="flex items-center gap-4">
            {legalLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] text-emerald-500/80 font-bold uppercase tracking-wider">
              System Active
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
