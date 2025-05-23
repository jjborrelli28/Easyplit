const AuthDivider = () => {
  return (
    <div className="relative">
      <div className="bg-background absolute inset-0 flex items-center">
        <div className="border-foreground/60 w-full border-t" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="bg-background text-foreground/75 px-4 font-semibold">
          O
        </span>
      </div>
    </div>
  );
};

export default AuthDivider;
