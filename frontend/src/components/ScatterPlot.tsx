/**
 * D3.js Scatter Plot - Academic research theme
 * Fixed layout, no axes/grid, stable scale
 */
import { useEffect, useRef, useCallback, useState } from 'react';
import { Box, Text, Spinner, HStack, Circle } from '@chakra-ui/react';
import * as d3 from 'd3';
import { useDashboardStore } from '../store/dashboardStore';
import type { EmbeddingPoint } from '../types';

// Tab10 colors for clusters (matplotlib tab10 palette)
const COLORS = {
    class: ['#E07B54', '#5B8BD0', '#6BAF6B'],
    cluster1: '#d62728',  // tab10 red
    cluster2: '#1f77b4',  // tab10 blue
    text: '#333',
    textMuted: '#888',
};

export function ScatterPlot() {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const [dimensions, setDimensions] = useState({ width: 400, height: 300 });

    const {
        embeddingData,
        config,
        clusters,
        selectCluster1,
        selectCluster2,
    } = useDashboardStore();

    const margin = { top: 30, right: 30, bottom: 30, left: 30 };
    const innerWidth = dimensions.width - margin.left - margin.right;
    const innerHeight = dimensions.height - margin.top - margin.bottom;

    const classColors = config?.colors.class_colors || COLORS.class;
    const cluster1Color = COLORS.cluster1;
    const cluster2Color = COLORS.cluster2;

    // Responsive sizing - but keep consistent layout
    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                // Subtract header height (approximately 50px) for chart area
                setDimensions({ width: Math.max(width - 16, 200), height: Math.max(height - 66, 200) });
            }
        });

        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    const handleBrushEnd = useCallback(
        (event: d3.D3BrushEvent<EmbeddingPoint>) => {
            if (!event.selection || embeddingData.length === 0) return;

            const [[x0, y0], [x1, y1]] = event.selection as [[number, number], [number, number]];

            // Calculate scale from fresh data extent
            const xExtent = d3.extent(embeddingData, (d: EmbeddingPoint) => d.x) as [number, number];
            const yExtent = d3.extent(embeddingData, (d: EmbeddingPoint) => d.y) as [number, number];
            const xRange = xExtent[1] - xExtent[0];
            const yRange = yExtent[1] - yExtent[0];
            const xPadding = xRange * 0.15;
            const yPadding = yRange * 0.15;

            const xScale = d3.scaleLinear()
                .domain([xExtent[0] - xPadding, xExtent[1] + xPadding])
                .range([0, innerWidth]);
            const yScale = d3.scaleLinear()
                .domain([yExtent[0] - yPadding, yExtent[1] + yPadding])
                .range([innerHeight, 0]);

            const cluster1Set = new Set(clusters.cluster1 || []);
            const cluster2Set = new Set(clusters.cluster2 || []);

            const selectedIndices = embeddingData
                .filter((d) => {
                    if (cluster1Set.has(d.index) || cluster2Set.has(d.index)) return false;
                    const px = xScale(d.x);
                    const py = yScale(d.y);
                    return px >= x0 && px <= x1 && py >= y0 && py <= y1;
                })
                .map((d) => d.index);

            if (selectedIndices.length === 0) return;

            if (!clusters.cluster1) {
                selectCluster1(selectedIndices);
            } else if (!clusters.cluster2) {
                selectCluster2(selectedIndices);
            } else {
                selectCluster1(selectedIndices);
            }

            d3.select(svgRef.current).select('.brush').call(d3.brush().clear as any);
        },
        [embeddingData, clusters, innerWidth, innerHeight, selectCluster1, selectCluster2]
    );

    useEffect(() => {
        if (!svgRef.current || embeddingData.length === 0 || innerWidth <= 0 || innerHeight <= 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        // Calculate extent from ALL data points
        const xExtent = d3.extent(embeddingData, (d) => d.x) as [number, number];
        const yExtent = d3.extent(embeddingData, (d) => d.y) as [number, number];

        // Add generous padding to ensure all points fit within bounds
        const xRange = xExtent[1] - xExtent[0];
        const yRange = yExtent[1] - yExtent[0];
        const xPadding = xRange * 0.15;
        const yPadding = yRange * 0.15;

        // Create scale directly from data - no caching
        const xScale = d3.scaleLinear()
            .domain([xExtent[0] - xPadding, xExtent[1] + xPadding])
            .range([0, innerWidth]);

        const yScale = d3.scaleLinear()
            .domain([yExtent[0] - yPadding, yExtent[1] + yPadding])
            .range([innerHeight, 0]);

        const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        // No grid or axes - just points

        // Points
        const cluster1Set = new Set(clusters.cluster1 || []);
        const cluster2Set = new Set(clusters.cluster2 || []);

        const unselectedPoints = embeddingData.filter(
            (d) => !cluster1Set.has(d.index) && !cluster2Set.has(d.index)
        );
        const cluster1Points = embeddingData.filter((d) => cluster1Set.has(d.index));
        const cluster2Points = embeddingData.filter((d) => cluster2Set.has(d.index));

        // Unselected points - smaller size
        g.selectAll('.point-unselected')
            .data(unselectedPoints)
            .enter().append('circle')
            .attr('cx', (d) => xScale(d.x))
            .attr('cy', (d) => yScale(d.y))
            .attr('r', 3)
            .attr('fill', (d) => classColors[d.label % classColors.length])
            .attr('stroke', 'white')
            .attr('stroke-width', 0.5)
            .attr('opacity', 0.8);

        // Cluster 1 points (tab10 red) - slightly larger for selection
        g.selectAll('.point-c1')
            .data(cluster1Points)
            .enter().append('circle')
            .attr('cx', (d) => xScale(d.x))
            .attr('cy', (d) => yScale(d.y))
            .attr('r', 5)
            .attr('fill', cluster1Color)
            .attr('stroke', '#fff')
            .attr('stroke-width', 1.5)
            .attr('opacity', 1);

        // Cluster 2 points (tab10 blue) - slightly larger for selection
        g.selectAll('.point-c2')
            .data(cluster2Points)
            .enter().append('circle')
            .attr('cx', (d) => xScale(d.x))
            .attr('cy', (d) => yScale(d.y))
            .attr('r', 5)
            .attr('fill', cluster2Color)
            .attr('stroke', '#fff')
            .attr('stroke-width', 1.5)
            .attr('opacity', 1);

        // Brush
        const brush = d3.brush<EmbeddingPoint>()
            .extent([[0, 0], [innerWidth, innerHeight]])
            .on('end', handleBrushEnd);
        g.append('g').attr('class', 'brush').call(brush);

    }, [embeddingData, clusters, innerWidth, innerHeight, margin, classColors, cluster1Color, cluster2Color, handleBrushEnd]);

    return (
        <Box
            ref={containerRef}
            h="100%"
            bg="white"
            borderRadius="4px"
            border="1px solid"
            borderColor="#e0e0e0"
            display="flex"
            flexDirection="column"
            overflow="hidden"
        >
            {/* Header */}
            <Box px={4} py={3} borderBottom="1px solid" borderColor="#e0e0e0" flexShrink={0}>
                <HStack justify="space-between" align="center">
                    <Text fontSize="sm" fontWeight="600" color="#333">
                        Embedding Space
                    </Text>
                    {/* Legend */}
                    <HStack spacing={4}>
                        {classColors.map((color, i) => (
                            <HStack key={i} spacing={1}>
                                <Circle size="8px" bg={color} />
                                <Text fontSize="10px" color="#888">FY{2014 + i}</Text>
                            </HStack>
                        ))}
                    </HStack>
                </HStack>
            </Box>

            {/* Chart */}
            <Box flex="1" p={2} overflow="hidden" position="relative">
                {embeddingData.length === 0 ? (
                    <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" textAlign="center">
                        <Spinner size="md" color="#555" mb={3} thickness="2px" />
                        <Text color="#888" fontSize="sm">Click "Execute" to compute embedding</Text>
                    </Box>
                ) : (
                    <svg
                        ref={svgRef}
                        width="100%"
                        height="100%"
                        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
                        preserveAspectRatio="xMidYMid meet"
                        style={{ display: 'block', maxWidth: '100%', maxHeight: '100%' }}
                    />
                )}
            </Box>
        </Box>
    );
}
