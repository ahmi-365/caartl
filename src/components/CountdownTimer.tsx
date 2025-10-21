import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CountdownTimer = ({ timeLeft }) => {
  const [time, setTime] = useState(timeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prevTime => {
        let { days, hours, minutes, seconds } = prevTime;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else if (days > 0) {
          days--;
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (value) => value.toString().padStart(2, '0');

  return (
    <View style={styles.container}>
      <View style={styles.timeBox}>
        <Text style={styles.timeText}>
          {time.days}{'\n'}Days
        </Text>
      </View>
      <View style={styles.timeBox}>
        <Text style={styles.timeText}>
          {formatTime(time.hours)}{'\n'}Hour{time.hours !== 1 ? 's' : ''}
        </Text>
      </View>
      <View style={styles.timeBox}>
        <Text style={styles.timeText}>
          {formatTime(time.minutes)}{'\n'}Min
        </Text>
      </View>
      <View style={styles.timeBox}>
        <Text style={styles.timeText}>
          {formatTime(time.seconds)}{'\n'}Sec
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  timeBox: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.46)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  timeText: {
    fontSize: 10,
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 12,
  },
});

export default CountdownTimer;
