/**
 * Feature Ranking - Diverging Bar Chart
 * Academic research theme with contribution visualization
 */
import { useEffect, useRef, useState } from 'react';
import { Box, Text, Center, HStack, Circle } from '@chakra-ui/react';
import * as d3 from 'd3';
import { useDashboardStore } from '../store/dashboardStore';

// Tab10 color palette for clusters
const COLORS = {
    positive: '#d62728',  // tab10 red - higher in cluster 1
    negative: '#1f77b4',  // tab10 blue - higher in cluster 2
    text: '#333',
    textMuted: '#888',
    bg: '#fafafa',
};

export function FeatureRanking() {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const [dimensions, setDimensions] = useState({ width: 400, height: 300 });
    const { topFeatures } = useDashboardStore();

    // Responsive sizing
    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                setDimensions({ width: Math.max(width, 200), height: Math.max(height, 200) });
            }
        });

        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    // Draw diverging bar chart
    useEffect(() => {
        if (!svgRef.current || !topFeatures || topFeatures.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const margin = { top: 10, right: 50, bottom: 10, left: 100 };
        const width = dimensions.width - margin.left - margin.right;
        const height = dimensions.height - margin.top - margin.bottom;

        if (width <= 0 || height <= 0) return;

        const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        // Calculate bar height to fit all items in available space
        const totalItems = topFeatures.length;
        const barGap = 4;
        const barHeight = Math.max(12, Math.min(24, (height - (totalItems - 1) * barGap) / totalItems));

        // Prepare data - use mean_diff for direction
        const data = topFeatures.map((f, i) => ({
            label: `#${f.rank}  ${f.rack}-${f.variable}`,
            value: f.mean_diff, // positive = higher in C1, negative = higher in C2
            score: f.score,
            rank: f.rank,
            pValue: f.statistical_result.p_value,
            index: i,
        }));

        // Scale for bars - symmetric around zero
        const maxAbs = d3.max(data, d => Math.abs(d.value)) || 1;
        const xScale = d3.scaleLinear()
            .domain([-maxAbs, maxAbs])
            .range([0, width]);

        const centerX = xScale(0);

        // Draw center line
        g.append('line')
            .attr('x1', centerX)
            .attr('x2', centerX)
            .attr('y1', 0)
            .attr('y2', data.length * (barHeight + barGap))
            .attr('stroke', '#ddd')
            .attr('stroke-width', 1);

        // Draw bars
        const bars = g.selectAll('.bar-group')
            .data(data)
            .enter()
            .append('g')
            .attr('class', 'bar-group')
            .attr('transform', (_, i) => `translate(0, ${i * (barHeight + barGap)})`);

        // Bar rectangles
        bars.append('rect')
            .attr('x', d => d.value >= 0 ? centerX : xScale(d.value))
            .attr('y', 0)
            .attr('width', d => Math.abs(xScale(d.value) - centerX))
            .attr('height', barHeight)
            .attr('fill', d => d.value >= 0 ? COLORS.positive : COLORS.negative)
            .attr('opacity', d => d.pValue < 0.05 ? 0.9 : 0.5)
            .attr('rx', 2);

        // Feature labels (left side)
        bars.append('text')
            .attr('x', -8)
            .attr('y', barHeight / 2)
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .attr('fill', COLORS.text)
            .attr('font-size', '11px')
            .attr('font-weight', (_, i) => i < 3 ? '600' : '400')
            .text(d => d.label);

        // Value labels (on bars)
        bars.append('text')
            .attr('x', d => d.value >= 0 ? xScale(d.value) + 4 : xScale(d.value) - 4)
            .attr('y', barHeight / 2)
            .attr('text-anchor', d => d.value >= 0 ? 'start' : 'end')
            .attr('dominant-baseline', 'middle')
            .attr('fill', COLORS.textMuted)
            .attr('font-size', '9px')
            .text(d => d.value.toFixed(2));

        // Significance indicator
        bars.filter(d => d.pValue < 0.05)
            .append('text')
            .attr('x', d => d.value >= 0 ? centerX - 4 : centerX + 4)
            .attr('y', barHeight / 2)
            .attr('text-anchor', d => d.value >= 0 ? 'end' : 'start')
            .attr('dominant-baseline', 'middle')
            .attr('fill', d => d.value >= 0 ? COLORS.positive : COLORS.negative)
            .attr('font-size', '9px')
            .attr('font-weight', '600')
            .text('*');

    }, [topFeatures, dimensions]);

    if (!topFeatures || topFeatures.length === 0) {
        return (
            <Box ref={containerRef} h="100%" display="flex" flexDirection="column">
                <Box px={4} py={3} borderBottom="1px solid" borderColor="#e0e0e0">
                    <HStack spacing={4}>
                        <HStack spacing={1}>
                            <Circle size="8px" bg={COLORS.positive} />
                            <Text fontSize="10px" color="#888">Higher in C1</Text>
                        </HStack>
                        <HStack spacing={1}>
                            <Circle size="8px" bg={COLORS.negative} />
                            <Text fontSize="10px" color="#888">Higher in C2</Text>
                        </HStack>
                    </HStack>
                </Box>
                <Center flex="1">
                    <Text color="#888" fontSize="sm">
                        Select two clusters to view summary
                    </Text>
                </Center>
            </Box>
        );
    }

    return (
        <Box ref={containerRef} h="100%" display="flex" flexDirection="column" overflow="hidden">
            {/* Header with legend only - no title */}
            <Box px={4} py={3} borderBottom="1px solid" borderColor="#e0e0e0" flexShrink={0}>
                <HStack spacing={4}>
                    <HStack spacing={1}>
                        <Circle size="8px" bg={COLORS.positive} />
                        <Text fontSize="10px" color="#888">Higher in C1</Text>
                    </HStack>
                    <HStack spacing={1}>
                        <Circle size="8px" bg={COLORS.negative} />
                        <Text fontSize="10px" color="#888">Higher in C2</Text>
                    </HStack>
                </HStack>
            </Box>

            {/* Chart - no overflow, fit to container */}
            <Box flex="1" p={2} overflow="hidden">
                <svg
                    ref={svgRef}
                    width="100%"
                    height="100%"
                    viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
                    preserveAspectRatio="xMidYMid meet"
                    style={{ display: 'block' }}
                />
            </Box>
        </Box>
    );
}
