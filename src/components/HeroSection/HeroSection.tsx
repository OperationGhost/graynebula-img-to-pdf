export default function HeroSection() {
    const items = [
        { label: "Image to pdf", href: "/image-to-pdf", icon: "🖼️" },
        { label: "API Tools", href: "/utilities/api-tools", icon: "🔗" },
        { label: "File Converter", href: "/utilities/file-converter", icon: "📄" },
        { label: "Color Picker", href: "/utilities/color-picker", icon: "🎨" },
        { label: "Password Gen", href: "/utilities/password-generator", icon: "🔐" },
        { label: "JSON Formatter", href: "/utilities/json-formatter", icon: "📋" },
        { label: "URL Encoder", href: "/utilities/url-encoder", icon: "🔗" },
        { label: "Base64 Tools", href: "/utilities/base64-tools", icon: "🔤" },
        { label: "Regex Tester", href: "/utilities/regex-tester", icon: "🔍" },
        { label: "Hash Generator", href: "/utilities/hash-generator", icon: "🔒" },
        { label: "Image Optimizer", href: "/utilities/image-optimizer", icon: "🖼️" },
        { label: "Text Tools", href: "/utilities/text-tools", icon: "📝" },
        { label: "QR Generator", href: "/utilities/qr-generator", icon: "📱" },
        { label: "Unit Converter", href: "/utilities/unit-converter", icon: "⚖️" }
    ];

    return (
        <section className="relative bg-black text-white py-20">
            <div className="container mx-auto px-6">
                <p className="text-xl mb-12 text-center">Your gateway to cutting-edge utilities, extensions, and projects.</p>

                <div className="grid grid-cols-7 gap-6 max-w-7xl mx-auto">
                    {items.map((item, index) => (
                        <a
                            key={index}
                            href={item.href}
                            className="group block"
                        >
                            <div className="bg-gray-800 hover:bg-gray-700 transition-colors duration-300 rounded-lg p-6 flex flex-col items-center justify-center aspect-square border border-gray-700 hover:border-blue-500 group-hover:scale-105 transform transition-transform duration-300">
                                <div className="text-4xl mb-3">{item.icon}</div>
                                <h3 className="text-sm font-medium text-center text-gray-300 group-hover:text-white transition-colors duration-300">
                                    {item.label}
                                </h3>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}