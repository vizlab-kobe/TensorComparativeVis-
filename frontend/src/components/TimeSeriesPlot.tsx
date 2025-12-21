/**
 * Time Series Plot - Academic research theme
 * Responsive container with refined styling
 */
import { useEffect, useRef, useState } from 'react';
import { Box, HStack, IconButton, Text, Circle, VStack } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import * as d3 from 'd3';
import { useDashboardStore } from '../store/dashboardStore';
import { ScreenshotButton } from './ScreenshotButton';

// Academic color palette - tab10 for clusters
const COLORS = {
    cluster1: '#d62728',  // tab10 red
    cluster2: '#1f77b4',  // tab10 blue
    grid: '#f0f0f0',
    axis: '#888',
    text: '#333',
    textMuted: '#888',
};

export function TimeSeriesPlot() {
    const containerRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const [dimensions, setDimensions] = useState({ width: 400, height: 250 });
    const { topFeatures, currentFeatureIndex, setCurrentFeatureIndex } = useDashboardStore();

    const margin = { top: 20, right: 20, bottom: 50, left: 55 };
    const innerWidth = dimensions.width - margin.left - margin.right;
    const innerHeight = dimensions.height - margin.top - margin.bottom;

    const feature = topFeatures?.[currentFeatureIndex];

    // Responsive sizing
    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                setDimensions({ width: Math.max(width, 200), height: Math.max(height - 100, 150) });
            }
        });

        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    const handlePrev = () => {
        if (currentFeatureIndex > 0) setCurrentFeatureIndex(currentFeatureIndex - 1);
    };

    const handleNext = () => {
        if (topFeatures && currentFeatureIndex < topFeatures.length - 1) {
            setCurrentFeatureIndex(currentFeatureIndex + 1);
        }
    };

    useEffect(() => {
        if (!svgRef.current || !feature || innerWidth <= 0 || innerHeight <= 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        // Create or select tooltip
        let tooltip = d3.select('body').select('.ts-tooltip');
        if (tooltip.empty()) {
            tooltip = d3.select('body').append('div')
                .attr('class', 'ts-tooltip')
                .style('position', 'absolute')
                .style('background', 'rgba(0,0,0,0.8)')
                .style('color', 'white')
                .style('padding', '8px 12px')
                .style('border-radius', '4px')
                .style('font-size', '11px')
                .style('pointer-events', 'none')
                .style('opacity', 0)
                .style('z-index', 9999);
        }

        const cluster1Data = feature.cluster1_time.map((t, i) => ({
            time: new Date(t),
            value: feature.cluster1_data[i],
        }));

        const cluster2Data = feature.cluster2_time.map((t, i) => ({
            time: new Date(t),
            value: feature.cluster2_data[i],
        }));

        const allData = [...cluster1Data, ...cluster2Data];
        const xExtent = d3.extent(allData, (d) => d.time) as [Date, Date];
        const yExtent = d3.extent(allData, (d) => d.value) as [number, number];
        const yPadding = (yExtent[1] - yExtent[0]) * 0.15;

        const xScale = d3.scaleTime().domain(xExtent).range([0, innerWidth]);
        const yScale = d3.scaleLinear().domain([yExtent[0] - yPadding, yExtent[1] + yPadding]).range([innerHeight, 0]);

        const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        // Grid lines
        g.selectAll('line.grid')
            .data(yScale.ticks(5))
            .enter().append('line')
            .attr('x1', 0).attr('x2', innerWidth)
            .attr('y1', (d) => yScale(d)).attr('y2', (d) => yScale(d))
            .attr('stroke', COLORS.grid);

        const line = d3.line<{ time: Date; value: number }>()
            .x((d) => xScale(d.time))
            .y((d) => yScale(d.value))
            .curve(d3.curveMonotoneX);

        const sorted1 = [...cluster1Data].sort((a, b) => a.time.getTime() - b.time.getTime());
        const sorted2 = [...cluster2Data].sort((a, b) => a.time.getTime() - b.time.getTime());

        // Lines
        g.append('path')
            .datum(sorted1)
            .attr('fill', 'none')
            .attr('stroke', COLORS.cluster1)
            .attr('stroke-width', 2)
            .attr('d', line);

        g.append('path')
            .datum(sorted2)
            .attr('fill', 'none')
            .attr('stroke', COLORS.cluster2)
            .attr('stroke-width', 2)
            .attr('d', line);

        // Points - smaller for better visibility with dense data
        g.selectAll('.p1')
            .data(cluster1Data)
            .enter().append('circle')
            .attr('cx', (d) => xScale(d.time))
            .attr('cy', (d) => yScale(d.value))
            .attr('r', 2)
            .attr('fill', COLORS.cluster1)
            .attr('stroke', 'white')
            .attr('stroke-width', 0.5)
            .attr('opacity', 0.8)
            .style('cursor', 'pointer')
            .on('mouseover', function (event, d) {
                d3.select(this).attr('r', 4).attr('stroke-width', 1.5);
                tooltip
                    .style('opacity', 1)
                    .html(`<strong>Cluster 1</strong><br/>Time: ${d3.timeFormat('%Y-%m-%d %H:%M')(d.time)}<br/>Value: ${d.value.toFixed(3)}`)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', function () {
                d3.select(this).attr('r', 2).attr('stroke-width', 0.5);
                tooltip.style('opacity', 0);
            });

        g.selectAll('.p2')
            .data(cluster2Data)
            .enter().append('circle')
            .attr('cx', (d) => xScale(d.time))
            .attr('cy', (d) => yScale(d.value))
            .attr('r', 2)
            .attr('fill', COLORS.cluster2)
            .attr('stroke', 'white')
            .attr('stroke-width', 0.5)
            .attr('opacity', 0.8)
            .style('cursor', 'pointer')
            .on('mouseover', function (event, d) {
                d3.select(this).attr('r', 4).attr('stroke-width', 1.5);
                tooltip
                    .style('opacity', 1)
                    .html(`<strong>Cluster 2</strong><br/>Time: ${d3.timeFormat('%Y-%m-%d %H:%M')(d.time)}<br/>Value: ${d.value.toFixed(3)}`)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', function () {
                d3.select(this).attr('r', 2).attr('stroke-width', 0.5);
                tooltip.style('opacity', 0);
            });

        // Axes
        const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat(d3.timeFormat('%Y-%m') as any);
        const yAxis = d3.axisLeft(yScale).ticks(5);

        g.append('g')
            .attr('transform', `translate(0,${innerHeight})`)
            .call(xAxis)
            .call(g => g.select('.domain').attr('stroke', '#ddd'))
            .call(g => g.selectAll('.tick line').attr('stroke', '#ddd'))
            .call(g => g.selectAll('.tick text')
                .attr('fill', COLORS.textMuted)
                .attr('font-size', '10px')
                .attr('transform', 'rotate(-30)')
                .attr('text-anchor', 'end'));

        g.append('g')
            .call(yAxis)
            .call(g => g.select('.domain').attr('stroke', '#ddd'))
            .call(g => g.selectAll('.tick line').attr('stroke', '#ddd'))
            .call(g => g.selectAll('.tick text').attr('fill', COLORS.textMuted).attr('font-size', '10px'));

    }, [feature, innerWidth, innerHeight, margin]);

    if (!topFeatures || topFeatures.length === 0) {
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
            >
                <Box px={4} py={3} borderBottom="1px solid" borderColor="#e0e0e0">
                    <Text fontSize="sm" fontWeight="600" color="#333">
                        Time Series Comparison
                    </Text>
                </Box>
                <Box flex="1" display="flex" alignItems="center" justifyContent="center">
                    <Text color="#888" fontSize="sm">Select clusters to view time series</Text>
                </Box>
            </Box>
        );
    }

    const stat = feature?.statistical_result;

    return (
        <Box
            ref={(el) => { panelRef.current = el; containerRef.current = el; }}
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
                    <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="600" color="#333">
                            Time Series Comparison
                        </Text>
                        {feature && (
                            <Text fontSize="xs" color="#888">
                                #{feature.rank} {feature.rack}-{feature.variable}
                            </Text>
                        )}
                    </VStack>
                    {/* Legend */}
                    <HStack spacing={4}>
                        <HStack spacing={1}>
                            <Circle size="8px" bg={COLORS.cluster1} />
                            <Text fontSize="10px" color="#888">Cluster 1</Text>
                        </HStack>
                        <HStack spacing={1}>
                            <Circle size="8px" bg={COLORS.cluster2} />
                            <Text fontSize="10px" color="#888">Cluster 2</Text>
                        </HStack>
                        <ScreenshotButton targetRef={panelRef} filename="time_series" />
                    </HStack>
                </HStack>
            </Box>

            {/* Chart */}
            <Box flex="1" p={2} overflow="hidden">
                <svg
                    ref={svgRef}
                    width="100%"
                    height="100%"
                    viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
                    preserveAspectRatio="xMidYMid meet"
                    style={{ display: 'block', maxWidth: '100%', maxHeight: '100%' }}
                />
            </Box>

            {/* Navigation & Stats */}
            <Box borderTop="1px solid" borderColor="#e0e0e0" px={4} py={2} flexShrink={0}>
                <HStack justify="space-between" align="center">
                    {/* Stats with significance badge */}
                    {stat && (
                        <HStack spacing={3} fontSize="xs">
                            <Box
                                px={2}
                                py={0.5}
                                borderRadius="3px"
                                bg={stat.p_value < 0.05 ? '#e8f5e9' : '#f5f5f5'}
                                border="1px solid"
                                borderColor={stat.p_value < 0.05 ? '#c8e6c9' : '#e0e0e0'}
                            >
                                <Text
                                    color={stat.p_value < 0.05 ? '#2e7d32' : '#888'}
                                    fontWeight="600"
                                    fontSize="10px"
                                >
                                    {stat.p_value < 0.05 ? '✓ Significant' : 'Not Significant'}
                                </Text>
                            </Box>
                            <Text color="#888">
                                p={stat.p_value.toFixed(3)}, d={stat.cohen_d.toFixed(2)}
                            </Text>
                        </HStack>
                    )}

                    {/* Navigation */}
                    <HStack spacing={2}>
                        <IconButton
                            aria-label="Previous"
                            icon={<ChevronLeftIcon />}
                            size="xs"
                            variant="ghost"
                            isDisabled={currentFeatureIndex === 0}
                            onClick={handlePrev}
                        />
                        <Text fontSize="xs" color="#888" minW="50px" textAlign="center">
                            {currentFeatureIndex + 1} / {topFeatures.length}
                        </Text>
                        <IconButton
                            aria-label="Next"
                            icon={<ChevronRightIcon />}
                            size="xs"
                            variant="ghost"
                            isDisabled={currentFeatureIndex === topFeatures.length - 1}
                            onClick={handleNext}
                        />
                    </HStack>
                </HStack>
            </Box>
        </Box>
    );
}
