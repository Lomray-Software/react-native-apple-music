import React, { useRef, useCallback, useMemo } from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';
import type { ViewStyle, GestureResponderEvent, LayoutChangeEvent } from 'react-native';

interface IProgressBarProps {
  progress: number;
  onSeek: (progress: number) => void;
}

const ProgressBar: React.FC<IProgressBarProps> = ({ progress, onSeek }) => {
  const containerRef = useRef<View>(null);
  const widthRef = useRef(0);
  const offsetXRef = useRef(0);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    widthRef.current = event.nativeEvent.layout.width;
    // Measure the actual position on screen
    containerRef.current?.measure((_x, _y, _width, _height, pageX) => {
      offsetXRef.current = pageX;
    });
  }, []);

  const calculateProgress = useCallback((pageX: number): number => {
    if (widthRef.current === 0) {
      return 0;
    }

    const relativeX = pageX - offsetXRef.current;

    return Math.max(0, Math.min(1, relativeX / widthRef.current));
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event: GestureResponderEvent) => {
          const newProgress = calculateProgress(event.nativeEvent.pageX);

          onSeek(newProgress);
        },
        onPanResponderMove: (event: GestureResponderEvent) => {
          const newProgress = calculateProgress(event.nativeEvent.pageX);

          onSeek(newProgress);
        },
      }),
    [calculateProgress, onSeek],
  );

  const safeProgress = Math.max(0, Math.min(1, progress));
  const progressPercent = `${safeProgress * 100}%`;

  const width = { width: progressPercent };
  const left = { left: progressPercent };

  return (
    <View
      ref={containerRef}
      style={styles.container}
      onLayout={handleLayout}
      {...panResponder.panHandlers}
    >
      <View style={styles.track}>
        <View style={[styles.fill, width as ViewStyle]} />
      </View>
      <View style={[styles.thumb, left as ViewStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 30,
    justifyContent: 'center',
  },
  track: {
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  thumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#007AFF',
    marginLeft: -7,
    top: 8,
  },
});

export default ProgressBar;
