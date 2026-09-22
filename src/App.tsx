import { ThemeProvider } from './themes/ThemeContext';
import { EditorLayout } from './panels/EditorLayout';

export default function App() {
  return (
    <ThemeProvider>
      <EditorLayout />
    </ThemeProvider>
  );
}
