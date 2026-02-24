"use client";

import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

export interface CarouselSlide {
  id: number;
  image: string | null;
  title: string;
  subtitle?: string;
  href: string;
  gradient?: string;
}

const defaultGradients = [
  "from-brand to-brand-purple",
  "from-emerald-600 to-teal-700",
  "from-orange-500 to-red-600",
  "from-purple-600 to-pink-600",
  "from-cyan-600 to-blue-700",
];

export default function HeroCarousel({ slides }: { slides: CarouselSlide[] }) {
  if (slides.length === 0) return null;

  return (
    <Carousel
      opts={{ loop: true }}
      plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
      className="w-full"
    >
      <CarouselContent>
        {slides.map((slide, index) => (
          <CarouselItem key={slide.id}>
            <Link href={slide.href}>
              <div className="relative h-48 sm:h-56 md:h-64 rounded-xl overflow-hidden cursor-pointer group">
                {slide.image ? (
                  <>
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 1024px) 100vw, 800px"
                    />
                    <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/40 to-transparent" />
                  </>
                ) : (
                  <div
                    className={`absolute inset-0 bg-linear-to-r ${slide.gradient || defaultGradients[index % defaultGradients.length]}`}
                  />
                )}
                <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
                  <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-bold leading-tight drop-shadow-lg max-w-lg">
                    {slide.title}
                  </h2>
                  {slide.subtitle && (
                    <p className="text-white/80 text-sm sm:text-base mt-1 drop-shadow max-w-md">
                      {slide.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      {slides.length > 1 && (
        <>
          <CarouselPrevious className="left-3 bg-white/80 hover:bg-white border-0 shadow-md" />
          <CarouselNext className="right-3 bg-white/80 hover:bg-white border-0 shadow-md" />
        </>
      )}
    </Carousel>
  );
}
