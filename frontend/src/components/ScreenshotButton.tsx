/**
 * Screenshot Button Component
 * Captures a screenshot of the referenced element and downloads as PNG
 */
import { IconButton, Tooltip } from '@chakra-ui/react';
import html2canvas from 'html2canvas';
import React from 'react';

interface ScreenshotButtonProps {
    targetRef: React.RefObject<HTMLDivElement | null>;
    filename?: string;
}

export function ScreenshotButton({ targetRef, filename = 'screenshot' }: ScreenshotButtonProps) {
    const handleScreenshot = async () => {
        if (!targetRef.current) return;

        const element = targetRef.current;

        // Store original styles
        const originalHeight = element.style.height;
        const originalMaxHeight = element.style.maxHeight;
        const originalOverflow = element.style.overflow;

        try {
            // Temporarily expand to show all content
            element.style.height = 'auto';
            element.style.maxHeight = 'none';
            element.style.overflow = 'visible';

            // Wait for reflow
            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = await html2canvas(element, {
                backgroundColor: '#ffffff',
                scale: 2, // Higher resolution
                logging: false,
                height: element.scrollHeight,
                windowHeight: element.scrollHeight,
            });

            const link = document.createElement('a');
            link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Screenshot failed:', error);
        } finally {
            // Restore original styles
            element.style.height = originalHeight;
            element.style.maxHeight = originalMaxHeight;
            element.style.overflow = originalOverflow;
        }
    };

    return (
        <Tooltip label="Save as PNG" fontSize="xs">
            <IconButton
                aria-label="Screenshot"
                icon={<CameraIcon />}
                size="xs"
                variant="ghost"
                onClick={handleScreenshot}
                color="#888"
                _hover={{ color: '#555', bg: '#f0f0f0' }}
            />
        </Tooltip>
    );
}

// Simple camera icon
function CameraIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="12" cy="12" r="3" />
            <path d="M9 5V3h6v2" />
        </svg>
    );
}
