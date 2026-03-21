-----------
Title: Construction of Time
Category: Foundations
Chapter: 1
Section: 1
Language: English
Date created: 3/17/2026
-----------

## Existence of Time

Before one shall concern the creations from the God, the scope of time shall be naturally explored. Rather than having time being created, we endorse that time exists consistently, in the format of $\mathbb{R}/ 2\pi \cong \mathbb{R} \cup \{\infty\}$.

Some diligent readers might ask: Why do we format time in this format? This construction somewhat correlates with the general projective space, so that $+\infty$ and $-\infty$ coincides. 

In this construction, there will be two definitions for time, the time designated to a local scale and the time designated to a global scale.

- The local scale of time works exactly like we interpret time, the length of an hour feels exactly the same now or compared to 10 years ago.  
- The global scale of time marks the global view of time, there exists a time $\infty$ (on local scale) or $0 \equiv 2\pi$ (on global scale) that is never reachable within finitely amount of time.

The conversion between the local and global time is given by the following formula $\varphi:\mathbb{R} \cup \{\infty\}\to \mathbb{R}/2\pi$:

$$
    \varphi(t_{\mathrm{loc}}) = \begin{cases}
        2\arctan(t_{\mathrm{loc}}) + \pi, & \text{ if } t_{\mathrm{loc}} \neq \infty,\\
        0, & \text{ if } t_{\mathrm{loc}} = \infty.
    \end{cases}
$$

Specifically, we note that $\infty = -\infty$ and $\varphi$ is clearly invertible.