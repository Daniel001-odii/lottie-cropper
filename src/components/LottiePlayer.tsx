import React, { useEffect, useRef } from 'react';
import lottie, { AnimationItem } from 'lottie-web';

interface LottiePlayerProps {
  animationData: any;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function LottiePlayer({ animationData, loop = true, autoplay = true, className, style }: LottiePlayerProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current || !animationData) return;

    // Use JSON parse stringify to ensure lottie-web doesn't mutate our state objects
    const dataClone = JSON.parse(JSON.stringify(animationData));

    const anim = lottie.loadAnimation({
      container: container.current,
      renderer: 'svg',
      loop,
      autoplay,
      animationData: dataClone,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid meet',
      }
    });

    return () => {
      anim.destroy();
    };
  }, [animationData, loop, autoplay]);

  return <div ref={container} className={className} style={{...style, width: '100%', height: '100%'}} />;
}
