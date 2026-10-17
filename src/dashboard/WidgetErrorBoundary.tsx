import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  onRemove: () => void
  editing: boolean
}

interface State {
  error: Error | null
}

/**
 * Widgets are driven by user-editable JSON round-tripped through the backend (see
 * DashboardController) — a bad widget should never take down the whole dashboard.
 * React error boundaries must be class components; there's no hook equivalent.
 */
export class WidgetErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="rounded-lg border border-red-900 bg-red-950/30 p-4">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-sm font-medium text-red-300">Chart failed to render</h3>
            {this.props.editing && (
              <button
                type="button"
                onClick={this.props.onRemove}
                className="text-xs text-red-500 hover:text-red-300"
              >
                Remove
              </button>
            )}
          </div>
          <p className="text-xs text-red-500/80">{this.state.error.message}</p>
        </div>
      )
    }
    return this.props.children
  }
}
