import React, { useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VirtualListProps<T> {
    items: T[];
    renderItem: (item: T) => React.ReactNode;
    estimateSize: () => number;
    title: string;
}

export function VirtualList<T>({ items, renderItem, estimateSize, title }: VirtualListProps<T>) {
    const parentRef = useRef<HTMLDivElement>(null);

    const virtualizer = useVirtualizer({
        count: items.length,
        getScrollElement: () => parentRef.current,
        estimateSize: estimateSize,
        overscan: 5,
    });

    const virtualItems = useMemo(() => virtualizer.getVirtualItems(), [virtualizer]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div
                    ref={parentRef}
                    style={{
                        height: '400px',
                        overflow: 'auto',
                    }}
                >
                    <div
                        style={{
                            height: `${virtualizer.getTotalSize()}px`,
                            width: '100%',
                            position: 'relative',
                        }}
                    >
                        {virtualItems.map((virtualItem) => (
                            <div
                                key={virtualItem.key}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    transform: `translateY(${virtualItem.start}px)`,
                                }}
                            >
                                {renderItem(items[virtualItem.index])}
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}