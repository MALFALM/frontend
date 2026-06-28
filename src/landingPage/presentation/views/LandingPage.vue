<template>
  <div class="landing-page">
    <Navbar @loginRequested="showCaptcha" />
    <main>
      <HeroSection @loginRequested="showCaptcha" />
      <FeaturesSection />
      <StepsSection />
      <TransparencySection />
      <AboutSection />
    </main>
    <Footer />
    
    <CaptchaModal :isOpen="isCaptchaOpen" @verified="handleCaptchaSuccess" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import HeroSection from '../components/HeroSection.vue';
import FeaturesSection from '../components/FeaturesSection.vue';
import StepsSection from '../components/StepsSection.vue';
import TransparencySection from '../components/TransparencySection.vue';
import AboutSection from '../components/AboutSection.vue';
import Footer from '../components/Footer.vue';
import CaptchaModal from '../components/CaptchaModal.vue';

const router = useRouter();
const isCaptchaOpen = ref(false);

const showCaptcha = () => {
  isCaptchaOpen.value = true;
};

const handleCaptchaSuccess = () => {
  isCaptchaOpen.value = false;
  router.push('/login');
};
</script>

<style scoped>
.landing-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
main {
  flex: 1;
}
</style>
