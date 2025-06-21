"use client";

import { motion, useMotionValue, useTransform, animate, Variants } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Head from "next/head";

// Define an interface for the particle properties for better type safety
interface Particle {
  size: number;
  duration: number;
  delay: number;
  x: number;
  y: number;
  color: string;
}

const ParticleBackground = () => {
  // 1. State will be empty on initial render (both server and client)
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // 2. This effect runs ONLY on the client, after the component has mounted
  useEffect(() => {
    // Generate the random particle data here
    const newParticles = Array.from({ length: 40 }).map(() => ({
      size: Math.random() * 8 + 2,
      duration: Math.random() * 10 + 5,
      delay: Math.random() * 5,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: `rgba(${Math.floor(Math.random() * 100 + 100)}, 
                    ${Math.floor(Math.random() * 100 + 100)}, 
                    ${Math.floor(Math.random() * 255)}, 
                    ${Math.random() * 0.3 + 0.1})`,
    }));
    // Set the state, which triggers a re-render with the particles
    setParticles(newParticles);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth - 0.5,
        y: e.clientY / window.innerHeight - 0.5,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []); // Empty dependency array ensures this runs only once

  return (
    <div className="absolute inset-0 overflow-hidden z-0">
      {/* 3. Map over the state. It will be empty initially, preventing mismatch. */}
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
          }}
          animate={{
            x: [0, (Math.random() - 0.5 + mousePosition.x * 2) * 200],
            y: [0, (Math.random() - 0.5 + mousePosition.y * 2) * 200],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            repeatType: "reverse",
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

const AnimatedCounter = ({ value, duration = 2 }: { value: number, duration?: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const animation = animate(count, value, { duration });
    return animation.stop;
  }, [value, count, duration]);

  return <motion.span>{rounded}</motion.span>;
};

const AttentionVisualization = () => {
  const [attentionLevel, setAttentionLevel] = useState(85);
  const [isLooking, setIsLooking] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const change = Math.random() * 20 - 10;
      setAttentionLevel((prev) => Math.min(100, Math.max(30, prev + change)));
      setIsLooking(Math.random() > 0.3);
    }, 2500);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const attentionColor =
    attentionLevel > 80
      ? "#10B981"
      : attentionLevel > 60
      ? "#FBBF24"
      : "#EF4444";

  return (
    <div className="relative w-full h-64 md:h-80 rounded-xl bg-gradient-to-br from-blue-100/50 to-purple-100/50 backdrop-blur-sm overflow-hidden flex items-center justify-center border border-white/30">
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-48 h-48 rounded-full bg-white opacity-10"
          animate={{
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative z-10 w-32 h-32 rounded-full border-4 border-white/50 bg-gray-800/80 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-blue-500 opacity-10"></div>
        </div>

        <motion.div
          className="absolute top-1/3 left-1/4 w-4 h-4 rounded-full bg-blue-500"
          animate={{
            x: isLooking ? 0 : -5,
            y: isLooking ? 0 : 5,
          }}
          transition={{ type: "spring", stiffness: 300 }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-4 h-4 rounded-full bg-blue-500"
          animate={{
            x: isLooking ? 0 : 5,
            y: isLooking ? 0 : 5,
          }}
          transition={{ type: "spring", stiffness: 300 }}
        />

        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-gray-300 rounded-full"
          animate={{
            width: isLooking ? 8 : 16,
            height: isLooking ? 2 : 4,
          }}
          transition={{ type: "spring", stiffness: 200 }}
        />

        <motion.div
          className="absolute top-4 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full"
          style={{ backgroundColor: attentionColor }}
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="absolute bottom-6 left-0 right-0">
        <div className="h-3 bg-gray-700/30 rounded-full mx-auto w-64 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              backgroundColor: attentionColor,
              width: `${attentionLevel}%`,
            }}
            animate={{ width: `${attentionLevel}%` }}
            transition={{ duration: 1 }}
          />
        </div>
        <motion.p
          className="text-sm mt-2 font-medium"
          style={{ color: attentionColor }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Attention Level: {attentionLevel}% -{" "}
          {attentionLevel > 80
            ? "High Focus"
            : attentionLevel > 60
            ? "Moderate Focus"
            : "Low Focus"}
        </motion.p>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, color, index }: { icon: string, title: string, description: string, color: string, index: number }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="bg-white/90 rounded-2xl shadow-xl overflow-hidden border border-white/50 relative overflow-hidden backdrop-blur-sm"
      whileHover={{
        y: -10,
        scale: 1.03,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      custom={index}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className={`h-2 bg-gradient-to-r ${color}`} />
      <div className="p-6 relative z-10">
        <motion.div
          className="text-5xl mb-4"
          animate={{ rotate: isHovered ? [0, 10, -10, 0] : 0 }}
          transition={{ duration: 0.5 }}
        >
          {icon}
        </motion.div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>

      {isHovered && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
        />
      )}

      <motion.div
        className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-blue-200/20 blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 10, 0],
          y: [0, -10, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
};

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  const [downloadCount, setDownloadCount] = useState(12784);
  const [userCount, setUserCount] = useState(5423)
  const [activeStep, setActiveStep] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);

    const interval = setInterval(() => {
      setDownloadCount((prev) => prev + Math.floor(Math.random() * 10));
      setUserCount((prev) => prev + Math.floor(Math.random() * 5));
    }, 3000);

    const featureInterval = setInterval(() => {
     
    }, 5000);

    const stepInterval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 4000);

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      setScrollProgress(Math.min(100, (scrollY / totalHeight) * 100));
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      clearInterval(interval);
      clearInterval(featureInterval);
      clearInterval(stepInterval);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.33, 1, 0.68, 1],
      },
    },
  };

  const fadeIn: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeInOut",
      },
    },
  };

  const features = [
    {
      icon: "🚀",
      title: "Lightweight Chrome Extension",
      description: "No sign-up needed, simple installation in seconds.",
      color: "from-blue-400 to-blue-600",
    },
    {
      icon: "👁️",
      title: "Real-time Tracking",
      description:
        "TensorFlow.js + MediaPipe for accurate face & eye detection directly in browser.",
      color: "from-purple-400 to-purple-600",
    },
    {
      icon: "💻",
      title: "Broad Compatibility",
      description: "Works with Google Meet, Zoom Web, and MS Teams seamlessly.",
      color: "from-pink-400 to-pink-600",
    },
    {
      icon: "🔒",
      title: "Privacy-First Approach",
      description: "All data processing happens locally in your browser.",
      color: "from-green-400 to-green-600",
    },
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Professor of Education, Stanford University",
      content:
        "EduPulse has transformed our online teaching experience. We can now see engagement levels in real-time and adjust our teaching approach accordingly.",
      initials: "SJ",
    },
    {
      name: "Michael Rodriguez",
      role: "High School Principal",
      content:
        "The privacy-first approach gives us peace of mind. We're seeing a 25% increase in student engagement since implementing EduPulse.",
      initials: "MR",
    },
    {
      name: "Emma Chen",
      role: "Online Learning Specialist",
      content:
        "The real-time insights have helped us identify at-risk students much earlier. The compatibility with all major platforms is a huge plus.",
      initials: "EC",
    },
  ];

  return (
    <>
      <Head>
        <title>EduPulse – Online Class Attentiveness Detector</title>
        <meta
          name="description"
          content="EduPulse: Real-time Attention Detection for Online Learning with a privacy-first Chrome Extension."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          property="og:title"
          content="EduPulse – Attention Detector Extension"
        />
        <meta
          property="og:description"
          content="Download EduPulse, the Chrome Extension that tracks attentiveness in real-time using face and eye tracking."
        />
        <meta property="og:image" content="/social-preview.png" />
        <meta
          property="og:url"
          content="https://your-deployed-site.vercel.app"
        />
        <link rel="icon" type="image/png" href="/favicon.png" />
      </Head>

      <motion.div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 z-50"
        style={{ width: `${scrollProgress}%` }}
        initial={{ width: 0 }}
      />

      <main className="min-h-screen flex flex-col items-center relative overflow-hidden bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-100 text-gray-900">
        <ParticleBackground />

        <motion.div
          className="absolute -left-20 -top-20 w-96 h-96 rounded-full bg-blue-200 blur-3xl opacity-40 z-0"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 15, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -right-20 top-1/3 w-80 h-80 rounded-full bg-purple-200 blur-3xl opacity-40 z-0"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.section
          className="relative z-10 w-full max-w-6xl px-6 py-24 md:py-32 flex flex-col items-center text-center"
          initial="hidden"
          animate={isVisible ? "show" : "hidden"}
          variants={containerVariants}
          ref={containerRef}
        >
          <motion.div
            className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-6 shadow-md"
            variants={itemVariants}
          >
            Now available on Chrome Web Store
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-extrabold mb-6 text-gray-800 leading-tight"
            variants={itemVariants}
          >
            <motion.span
              className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 8, repeat: Infinity }}
              style={{
                backgroundSize: "200% 200%",
              }}
            >
              EduPulse
            </motion.span>
            <br />
            <motion.span
              className="text-3xl md:text-4xl font-semibold text-gray-600"
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Real-time Attention Detection for Online Learning
            </motion.span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl mb-12 text-gray-600 max-w-3xl mx-auto"
            variants={itemVariants}
          >
            Enhance focus and learning outcomes with our privacy-first Chrome
            extension that tracks student engagement in real-time.
          </motion.p>

          <motion.div
            className="flex flex-wrap justify-center gap-8 mb-8"
            variants={itemVariants}
          >
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600">
                <AnimatedCounter value={downloadCount} duration={1} />+
              </div>
              <p className="text-gray-600">Downloads</p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-600">
                <AnimatedCounter value={userCount} duration={1} />+
              </div>
              <p className="text-gray-600">Active Users</p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-pink-600">
                99%
              </div>
              <p className="text-gray-600">Privacy Satisfaction</p>
            </div>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 mb-16"
            variants={itemVariants}
          >
            <motion.a
              href="/downloads/h.zip"
              download
              className="relative inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden"
              whileHover={{
                scale: 1.05,
                boxShadow: "0px 10px 30px rgba(79, 70, 229, 0.4)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">Download Chrome Extension</span>
              <span className="ml-3 relative z-10">↓</span>
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ opacity: 0 }}
              />
            </motion.a>

            <motion.a
              href="#features"
              className="inline-flex items-center justify-center bg-white text-gray-800 px-8 py-4 rounded-full text-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Learn More
            </motion.a>
          </motion.div>

          <AttentionVisualization />
        </motion.section>

        {/* Other sections remain the same */}
        <motion.section
          id="features"
          className="relative z-10 w-full max-w-6xl px-6 py-16 md:py-24"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          <motion.div className="text-center mb-16" variants={itemVariants}>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-800">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Designed to enhance learning experiences while respecting privacy
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                color={feature.color}
                index={index}
              />
            ))}
          </div>
        </motion.section>

        <motion.section
          className="relative z-10 w-full max-w-6xl px-6 py-16 md:py-24"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div className="text-center mb-16" variants={itemVariants}>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-800">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple setup, powerful insights
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((step, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center text-center relative"
                variants={itemVariants}
                custom={index}
                animate={{
                  scale: activeStep === index ? 1.05 : 1,
                  y: activeStep === index ? -5 : 0,
                }}
                whileHover={{ scale: 1.03 }}
              >
                {index < 2 && (
                  <div className="hidden md:block absolute top-24 right-[-30%] w-[60%] h-1 bg-gray-200 z-0"></div>
                )}
                <motion.div
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-6 border-4 border-white shadow-lg relative z-10"
                  animate={{
                    rotate: activeStep === index ? [0, 10, -10, 0] : 0,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                    {step}
                  </div>
                </motion.div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {index === 0 && "Install Extension"}
                  {index === 1 && "Join Online Class"}
                  {index === 2 && "Get Insights"}
                </h3>
                <p className="text-gray-600">
                  {index === 0 &&
                    "Add EduPulse from Chrome Web Store in seconds"}
                  {index === 1 && "Start your video conference as usual"}
                  {index === 2 && "View real-time engagement analytics"}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="relative z-10 w-full max-w-6xl px-6 py-16 md:py-24"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div className="text-center mb-16" variants={itemVariants}>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-800">
              Trusted by Educators
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what educators are saying about EduPulse
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-white/90 rounded-2xl shadow-xl p-6 border border-white/50 relative overflow-hidden backdrop-blur-sm"
                variants={itemVariants}
                custom={index}
                whileHover={{
                  y: -5,
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                }}
              >
                <div className="text-5xl mb-4 text-blue-500">❝</div>
                <p className="text-gray-600 mb-6 italic">
                  {testimonial.content}
                </p>
                <div className="flex items-center">
                  <motion.div
                    className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold mr-4"
                    animate={{
                      rotate: [0, 5, 0, -5, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {testimonial.initials}
                  </motion.div>
                  <div>
                    <p className="font-bold text-gray-800">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.footer
          className="relative z-10 w-full max-w-6xl px-6 py-12 text-center text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="mb-6">
            <motion.div
              className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                backgroundSize: "200% 200%",
              }}
            >
              EduPulse
            </motion.div>
            <p className="text-gray-500">
              Real-time engagement analytics for education
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <a
              href="#"
              className="hover:text-blue-600 transition-colors hover:underline"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="hover:text-blue-600 transition-colors hover:underline"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="hover:text-blue-600 transition-colors hover:underline"
            >
              Documentation
            </a>
            <a
              href="#"
              className="hover:text-blue-600 transition-colors hover:underline"
            >
              Contact
            </a>
          </div>
          <p>© {new Date().getFullYear()} EduPulse. All rights reserved.</p>
        </motion.footer>
      </main>
    </>
  );
}
