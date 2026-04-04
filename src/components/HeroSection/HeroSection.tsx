import Link from "next/link";

export default function HeroSection() {
  const items = [
    { label: "Image to pdf", href: "/image-to-pdf", icon: "🖼️" },
    { label: "API Tools", href: "/", icon: "🔗" },
    { label: "File Converter", href: "/", icon: "📄" },
    { label: "Color Picker", href: "/", icon: "🎨" },
    { label: "Password Gen", href: "/", icon: "🔐" },
    { label: "JSON Formatter", href: "/", icon: "📋" },
    { label: "URL Encoder", href: "/", icon: "🔗" },
    { label: "Base64 Tools", href: "/", icon: "🔤" },
    { label: "Regex Tester", href: "/", icon: "🔍" },
    { label: "Hash Generator", href: "/", icon: "🔒" },
    { label: "Image Optimizer", href: "/", icon: "🖼️" },
    { label: "Text Tools", href: "/", icon: "📝" },
    { label: "QR Generator", href: "/", icon: "📱" },
    { label: "Unit Converter", href: "/", icon: "⚖️" },
  ];

  return (
    <section className="relative bg-black text-white py-14 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <p className="text-base sm:text-xl mb-10 sm:mb-12 text-center text-gray-300">
          Your gateway to cutting-edge utilities, extensions, and projects.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 sm:gap-4 md:gap-6 max-w-7xl mx-auto">
          {items.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="group block"
            >
              <div className="bg-gray-800 hover:bg-gray-700 transition-all duration-300 rounded-lg p-4 sm:p-5 md:p-6 flex flex-col items-center justify-center aspect-square border border-gray-700 hover:border-blue-500 group-hover:scale-105">
                <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{item.icon}</div>
                <h3 className="text-xs sm:text-sm font-medium text-center text-gray-300 group-hover:text-white transition-colors duration-300">
                  {item.label}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}