import { Header } from '@/components/layout/Header';

export const TooManyRequests = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg-root transition-colors duration-200">
      <Header />

      <div
        className="flex flex-1 flex-col items-center justify-center select-none"
        style={{ fontFamily: '"Bitcount Grid Double", monospace' }}
      >
        <h1 className="text-8xl sm:text-9xl font-bold text-text-muted leading-none">429</h1>
        <p className="text-lg sm:text-xl font-light text-text-muted tracking-widest uppercase mt-4">
          too many requests
        </p>
        <p className="text-sm font-light text-text-muted tracking-widest mt-2 max-w-md text-center px-4 font-sans">
          You have been rate limited by the server. Please wait a moment before trying again.
        </p>
        <a
          href="/"
          className="mt-8 text-xs sm:text-sm text-text-secondary hover:text-text-primary tracking-widest uppercase cursor-pointer transition-colors duration-200"
        >
          &larr; return to dashboard
        </a>
      </div>
    </div>
  );
};

export default TooManyRequests;
