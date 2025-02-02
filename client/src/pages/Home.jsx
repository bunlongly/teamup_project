import Button from '../components/Button';
function HomePage() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-blue-100'>
      <h1 className='text-4xl font-bold text-indigo-600 mb-4'>
        Welcome to the Home Page
      </h1>
      <p className='text-lg text-gray-700 mb-6'>
        This is a simple page styled with Tailwind CSS.
      </p>
      <Button />
    </div>
  );
}

export default HomePage;
