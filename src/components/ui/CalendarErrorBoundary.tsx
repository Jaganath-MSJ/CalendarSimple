import React, { Component, ReactNode, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class CalendarErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Intentionally silent — the host app's own error reporting handles logging.
  }

  render() {
    if (this.state.hasError) {
      return <div data-testid="calendar-error-boundary" />;
    }
    return this.props.children;
  }
}
