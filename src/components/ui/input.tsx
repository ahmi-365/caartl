import React, { forwardRef } from "react";
import { TextInput, StyleSheet } from "react-native";

interface InputProps extends React.ComponentProps<typeof TextInput> {
  className?: string;
}

const Input = forwardRef<TextInput, InputProps>(({ style, ...props }, ref) => {
  return (
    <TextInput
      ref={ref}
      style={[styles.input, style]}
      placeholderTextColor="rgba(0,0,0,0.37)"
      {...props}
    />
  );
});

Input.displayName = "Input";

const styles = StyleSheet.create({
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#000000",
  },
});

export { Input };
