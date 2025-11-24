'use client';

import Image from 'next/image';

export default function ImageBackground() {
    return (
        <div className="fixed inset-0 -z-10">
            {/* 背景图片 */}
            <div className="absolute inset-0">
                <Image
                    src="/space-bg.png"
                    alt="Space background"
                    fill
                    className="object-cover"
                    priority
                    quality={100}
                />
            </div>

            {/* 渐变遮罩层 - 让文字更清晰可读 */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

            {/* 额外的暗化层（可选，根据图片亮度调整） */}
            <div className="absolute inset-0 bg-black/10" />
        </div>
    );
}
