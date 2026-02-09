'use client';

import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { MedicalTermCard, MedicalTermCardProps } from './MedicalTermCard';

interface MedicalTermsCarouselProps {
    terms: MedicalTermCardProps[];
}

export function MedicalTermsCarousel({ terms }: MedicalTermsCarouselProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [newTermIndex, setNewTermIndex] = useState<number | null>(null);

    // Track new terms for animation
    useEffect(() => {
        if (terms.length > 0) {
            setNewTermIndex(terms.length - 1);
            // Clear the "new" state after animation
            const timer = setTimeout(() => setNewTermIndex(null), 2000);
            return () => clearTimeout(timer);
        }
    }, [terms.length]);

    // Auto-scroll to newest term
    useEffect(() => {
        if (scrollContainerRef.current && terms.length > 0) {
            scrollContainerRef.current.scrollTo({
                left: scrollContainerRef.current.scrollWidth,
                behavior: 'smooth'
            });
        }
    }, [terms.length]);

    // Check scroll position for arrow visibility
    const checkScrollPosition = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        checkScrollPosition();
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScrollPosition);
            window.addEventListener('resize', checkScrollPosition);
            return () => {
                container.removeEventListener('scroll', checkScrollPosition);
                window.removeEventListener('resize', checkScrollPosition);
            };
        }
    }, [terms]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="relative w-full">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4 px-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/10">
                    <BookOpen className="w-4 h-4 text-white/70" />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-white/50">
                    Medical Terms
                </h2>
                {terms.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-bold text-white/50">
                        {terms.length}
                    </span>
                )}
            </div>

            {/* Carousel container */}
            <div className="relative group">
                {/* Left scroll button */}
                {canScrollLeft && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10
                            w-12 h-12 flex items-center justify-center
                            bg-gradient-to-r from-black/80 to-transparent
                            text-white/80 hover:text-white
                            transition-opacity duration-200
                            opacity-0 group-hover:opacity-100"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                )}

                {/* Right scroll button */}
                {canScrollRight && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10
                            w-12 h-12 flex items-center justify-center
                            bg-gradient-to-l from-black/80 to-transparent
                            text-white/80 hover:text-white
                            transition-opacity duration-200
                            opacity-0 group-hover:opacity-100"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                )}

                {/* Scrollable area */}
                <div
                    ref={scrollContainerRef}
                    className="flex gap-4 overflow-x-auto scrollbar-hide px-4 pb-4 pt-1
                        scroll-smooth snap-x snap-mandatory"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                    }}
                >
                    {terms.length === 0 ? (
                        <div className="flex items-center justify-center w-full min-h-[120px] text-white/30">
                            <p className="text-sm italic">Medical terms will appear here as they&apos;re detected...</p>
                        </div>
                    ) : (
                        terms.map((term, index) => (
                            <div key={`${term.term}-${index}`} className="snap-start">
                                <MedicalTermCard
                                    {...term}
                                    isNew={index === newTermIndex}
                                />
                            </div>
                        ))
                    )}
                </div>

                {/* Fade edges */}
                <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-[#0a0a0a] to-transparent pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none" />
            </div>
        </div>
    );
}
