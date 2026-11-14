import { useEffect, useRef, useState } from 'react';

type ScaledIframeProps = {
  src: string;
  title: string;
  /** 실제 폰 폭으로 그린 뒤 프레임 크기에 맞춰 줄인다 (좁은 폭에서 버튼 글자가 「제.」로 잘리는 문제 방지) */
  virtualWidth?: number;
  className?: string;
};

export function ScaledIframe({ src, title, virtualWidth = 390, className }: ScaledIframeProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = size.w > 0 ? size.w / virtualWidth : 1;

  return (
    <div ref={boxRef} className={`relative h-full w-full overflow-hidden ${className ?? ''}`}>
      {size.w > 0 ? (
        <iframe
          title={title}
          src={src}
          loading="lazy"
          className="absolute left-0 top-0 border-0"
          style={{
            width: virtualWidth,
            height: size.h / scale,
            transform: `scale(${scale})`,
            transformOrigin: '0 0',
          }}
        />
      ) : null}
    </div>
  );
}
