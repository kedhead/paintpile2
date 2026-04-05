import type { NextPageContext } from 'next';

function ErrorPage({ statusCode }: { statusCode: number }) {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#140A18',
        color: '#F0F0F0',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 700, color: '#FA4FD1', margin: 0 }}>
          {statusCode}
        </h1>
        <p style={{ marginTop: '1rem', fontSize: '1.1rem' }}>
          {statusCode === 404
            ? 'Page not found'
            : 'An error occurred'}
        </p>
        <a
          href="/feed"
          style={{
            display: 'inline-block',
            marginTop: '1.5rem',
            padding: '0.5rem 1.5rem',
            backgroundColor: '#FA4FD1',
            color: '#fff',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Go Home
        </a>
      </div>
    </div>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode: statusCode ?? 500 };
};

export default ErrorPage;
