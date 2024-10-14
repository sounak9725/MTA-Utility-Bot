// eslint-disable-next-line no-unused-vars
const { SlashCommandBuilder, EmbedBuilder, Client, CommandInteraction } = require('discord.js');
const { allowedRoles, restrictedRoles, maxAssignableRolePosition } = require('../../config.json').discord;
const { requiredRoles } = require('../../config.json').discord;
const { interactionEmbed } = require('../../functions');

module.exports = {
    name: "assign_role",
    description: "Assign a permitted role to a user.",
    data: new SlashCommandBuilder()
        .setName('assign_role')
        .setDescription('Assign a permitted role to a user.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to assign the role to.')
                .setRequired(true)
        )
        .addRoleOption(option => 
            option.setName('role')
                .setDescription('The role to assign.')
                .setRequired(true)
        ),
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {

        const hasRole = requiredRoles.some(roleId => interaction.member.roles.cache.has(roleId));
        if (!hasRole) {
            return interactionEmbed(3, "[ERR-UPRM]", '', interaction, client, [true, 30]);
        }

        // Retrieve options
        const user = interaction.options.getUser('user');
        const role = interaction.options.getRole('role');
        const member = interaction.guild.members.cache.get(user.id);
        const rolePosition = role.position; // Get the role's position in the hierarchy
        const botHighestRolePosition = interaction.guild.members.me.roles.highest.position; // Bot's highest role position

        await interaction.deferReply({ephemeral: true});


        // Check if the role is restricted
        if (restrictedRoles.includes(role.id)) {
            return interaction.editReply({ content: `You cannot assign the role **${role.name}** as it is restricted.`, ephemeral: true });
        }

        // Check if the role is allowed
        if (!allowedRoles.includes(role.id)) {
            return interaction.editReply({ content: `You can only assign permitted roles. The role **${role.name}** is not allowed.`, ephemeral: true });
        }

        // Ensure the bot has permission to assign this role (bot must have a higher role in the hierarchy)
        if (rolePosition >= botHighestRolePosition) {
            return interaction.editReply({ content: `I cannot assign the role **${role.name}** because it's higher or equal to my highest role in the hierarchy.`, ephemeral: true });
        }

        // Ensure the role position is less than or equal to the max assignable role position from config
        if (rolePosition > maxAssignableRolePosition) {
            return interaction.editReply({ content: `You cannot assign roles higher than the allowed maximum position.`, ephemeral: true });
        }

        // Assign the role to the user
        try {
            await member.roles.add(role);
            interaction.editReply({ content: `Successfully assigned the role **${role.name}** to ${user.tag}.`, ephemeral: true });
        } catch (error) {
            console.error('Error assigning role:', error);
            interaction.editReply({ content: `There was an error assigning the role.`, ephemeral: true });
        }
    },
};
