import { ThemeProvider } from './themes/ThemeContext';
import { EditorLayout } from './panels/EditorLayout';

export default function App() {
  return (
    <ThemeProvider>
      <div className="w-full h-full flex flex-col min-h-0">
        <EditorLayout />
      </div>
    </ThemeProvider>
  );
}
