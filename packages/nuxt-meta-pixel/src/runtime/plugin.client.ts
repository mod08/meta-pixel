import { defineNuxtPlugin, useRouter, useRuntimeConfig } from '#imports'
import { isNavigationFailure } from '#vue-router'
import { setup, type FacebookQuery } from 'meta-pixel'
import { minimatch } from 'minimatch'
import type { Plugin } from 'nuxt/app'

export default defineNuxtPlugin(() => {
  const runtimeConfig = useRuntimeConfig()
  const pixels = runtimeConfig.public.metapixel.pixels

  const { $fbq, init, pageView } = setup()
  $fbq.disablePushState = true

  for (const name in pixels) {
    const pixel = pixels[name]
    init(pixel.id.toString(), pixel.autoconfig)
  }

  const router = useRouter()
  router.afterEach((to, _, failure) => {
    if (isNavigationFailure(failure)) return

    for (const name in pixels) {
      const pixel = pixels[name]
      const match = minimatch(to.path, pixel.pageView ?? '**')
      if (match) {
        pageView(pixel.id.toString())
      }
    }
  })

  return {
    provide: {
      fbq: $fbq
    }
  } 
}) as Plugin<{fbq: FacebookQuery}>
