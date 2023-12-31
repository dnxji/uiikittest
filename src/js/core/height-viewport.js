import {
    boxModelAdjust,
    css,
    dimensions,
    endsWith,
    isNumeric,
    isString,
    isVisible,
    offsetPosition,
    offsetViewport,
    query,
    scrollParent,
    scrollParents,
    toFloat,
} from 'uikit-util';
import { resize } from '../api/observables';

export default {
    props: {
        expand: Boolean,
        offsetTop: Boolean,
        offsetBottom: Boolean,
        minHeight: Number,
    },

    data: {
        expand: false,
        offsetTop: false,
        offsetBottom: false,
        minHeight: 0,
    },

    // check for offsetTop change
    observe: resize({
        target: ({ $el }) => [$el, ...scrollParents($el)],
    }),

    update: {
        read() {
            if (!isVisible(this.$el)) {
                return false;
            }

            let minHeight = '';
            const box = boxModelAdjust(this.$el, 'height', 'content-box');

            const { body, scrollingElement } = document;
            const scrollElement = scrollParent(this.$el);
            const { height: viewportHeight } = offsetViewport(
                scrollElement === body ? scrollingElement : scrollElement
            );

            if (this.expand) {
                minHeight = `${
                    viewportHeight -
                    (dimensions(scrollElement).height - dimensions(this.$el).height) -
                    box
                }px`;
            } else {
                const isScrollingElement =
                    scrollingElement === scrollElement || body === scrollElement;

                // on mobile devices (iOS and Android) window.innerHeight !== 100vh
                minHeight = `calc(${isScrollingElement ? '100vh' : `${viewportHeight}px`}`;

                if (this.offsetTop) {
                    if (isScrollingElement) {
                        const top = offsetPosition(this.$el)[0] - offsetPosition(scrollElement)[0];
                        minHeight += top > 0 && top < viewportHeight / 2 ? ` - ${top}px` : '';
                    } else {
                        minHeight += ` - ${css(scrollElement, 'paddingTop')}`;
                    }
                }

                if (this.offsetBottom === true) {
                    minHeight += ` - ${dimensions(this.$el.nextElementSibling).height}px`;
                } else if (isNumeric(this.offsetBottom)) {
                    minHeight += ` - ${this.offsetBottom}vh`;
                } else if (this.offsetBottom && endsWith(this.offsetBottom, 'px')) {
                    minHeight += ` - ${toFloat(this.offsetBottom)}px`;
                } else if (isString(this.offsetBottom)) {
                    minHeight += ` - ${dimensions(query(this.offsetBottom, this.$el)).height}px`;
                }

                minHeight += `${box ? ` - ${box}px` : ''})`;
            }

            return { minHeight };
        },

        write({ minHeight }) {
            css(this.$el, 'minHeight', `max(${this.minHeight || 0}px, ${minHeight})`);
        },

        events: ['resize'],
    },
};
